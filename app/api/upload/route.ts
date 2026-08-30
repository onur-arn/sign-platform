import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { clientIp, rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { MAX_PDF_BYTES, RATE } from '@/lib/request-limits'

function cleanExtractedText(raw: string): string {
  return raw
    .replace(/\u0000/g, ' ')
    .replace(/\r/g, '\n')
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, ' ')
    .replace(/-{5,}Page\s*\(\d+\)\s*Break-{5,}/gi, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: buffer })
  try {
    const result = await parser.getText()
    return cleanExtractedText(String(result?.text ?? ''))
  } finally {
    try {
      await parser.destroy?.()
    } catch {
      /* ignore */
    }
  }
}

function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    try {
      return decodeURIComponent(raw.replace(/%(?![0-9A-Fa-f]{2})/g, '%25'))
    } catch {
      return raw
    }
  }
}

function extractWithPdf2json(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFParser = require('pdf2json')
    const parser = new PDFParser(null, 1)
    let settled = false

    const done = (fn: () => void) => {
      if (settled) return
      settled = true
      fn()
    }

    const timer = setTimeout(() => {
      done(() => reject(new Error('Délai dépassé lors de la lecture du PDF')))
    }, 25000)

    parser.on(
      'pdfParser_dataReady',
      (data: { Pages?: Array<{ Texts?: Array<{ R: Array<{ T: string }> }> }> }) => {
        clearTimeout(timer)
        done(() => {
          try {
            const fromTexts = (data.Pages ?? [])
              .flatMap((page) => page.Texts ?? [])
              .map((t) => safeDecode((t.R ?? []).map((r) => r.T ?? '').join('')))
              .join(' ')

            const raw =
              typeof parser.getRawTextContent === 'function'
                ? String(parser.getRawTextContent())
                : ''

            resolve(cleanExtractedText(fromTexts || raw))
          } catch {
            reject(new Error('Impossible de lire le contenu du PDF'))
          }
        })
      },
    )

    parser.on('pdfParser_dataError', (err: { parserError?: string }) => {
      clearTimeout(timer)
      done(() => reject(new Error(err?.parserError || 'Erreur lors du parsing PDF')))
    })

    try {
      parser.parseBuffer(buffer)
    } catch (err) {
      clearTimeout(timer)
      done(() =>
        reject(err instanceof Error ? err : new Error('Erreur lors du parsing PDF')),
      )
    }
  })
}

function isPdfUpload(file: { name?: string; type?: string }): boolean {
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.pdf')) return true
  return type === 'application/pdf' || type === 'application/x-pdf' || type === ''
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié — reconnectez-vous' }, { status: 401 })
    }

    const userKey = session.user.id || session.user.email || clientIp(req)
    const limited = await rateLimit(`upload:${userKey}`, RATE.upload.limit, RATE.upload.windowMs)
    if (!limited.ok) return rateLimitResponse(limited.retryAfterSec)

    const formData = await req.formData()
    const entry = formData.get('file')

    // Duck-typing : `instanceof File` peut échouer selon le runtime Node
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof (entry as Blob).arrayBuffer !== 'function'
    ) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    const file = entry as File

    if (!isPdfUpload(file)) {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 })
    }

    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: 'Le fichier ne doit pas dépasser 10 Mo' }, { status: 413 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Le fichier PDF est vide' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let text = ''
    let lastError: unknown

    try {
      text = await extractWithPdfParse(buffer)
    } catch (err) {
      lastError = err
      console.warn('pdf-parse failed, trying pdf2json:', err)
    }

    if (!text) {
      try {
        text = await extractWithPdf2json(buffer)
      } catch (err) {
        lastError = err
        console.warn('pdf2json failed:', err)
      }
    }

    if (!text) {
      const detail =
        lastError instanceof Error && lastError.message
          ? lastError.message
          : 'PDF scanné ou image uniquement'
      return NextResponse.json(
        { error: `Aucun texte détecté dans le PDF (${detail})` },
        { status: 422 },
      )
    }

    return NextResponse.json({ text })
  } catch (error) {
    console.error('Erreur extraction PDF:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Erreur lors du traitement du PDF',
      },
      { status: 500 },
    )
  }
}
