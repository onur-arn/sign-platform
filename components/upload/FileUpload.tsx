'use client'

import { useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface FileUploadProps {
  onTextExtracted: (text: string, fileUrl?: string) => void
}

async function extractPdfViaApi(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  })

  let data: { text?: string; error?: string } = {}
  try {
    data = await res.json()
  } catch {
    throw new Error(`Réponse serveur invalide (HTTP ${res.status})`)
  }

  if (!res.ok) {
    throw new Error(data.error || `Erreur serveur (HTTP ${res.status})`)
  }

  const text = (data.text || '').trim()
  if (!text) {
    throw new Error('Aucun texte détecté dans le PDF (PDF scanné ou image uniquement)')
  }
  return text
}

async function extractPdfInBrowser(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const { getDocument, GlobalWorkerOptions } = pdfjs

  if (!getDocument) {
    throw new Error('Lecteur PDF navigateur indisponible')
  }

  // Worker local (évite le fake worker)
  if (GlobalWorkerOptions) {
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  }

  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
    useWorkerFetch: false,
  }).promise

  try {
    const parts: string[] = []
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const line = content.items
        .map((item) => ('str' in item ? String((item as { str: string }).str) : ''))
        .filter(Boolean)
        .join(' ')
      if (line.trim()) parts.push(line.trim())
    }
    return parts.join('\n').replace(/[ \t]{2,}/g, ' ').trim()
  } finally {
    await doc.destroy()
  }
}

export default function FileUpload({ onTextExtracted }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  const processFile = async (file: File) => {
    const name = file.name.toLowerCase()
    const type = (file.type || '').toLowerCase()
    const looksPdf =
      type === 'application/pdf' ||
      type === 'application/x-pdf' ||
      name.endsWith('.pdf')

    if (!looksPdf) {
      setError(t.dashboard.uploadHint)
      return
    }

    setError('')
    setUploading(true)
    setFileName(file.name)

    const errors: string[] = []

    try {
      try {
        const text = await extractPdfViaApi(file)
        onTextExtracted(text)
        setFileName('')
        return
      } catch (apiErr) {
        const msg = apiErr instanceof Error ? apiErr.message : String(apiErr)
        errors.push(msg)
        console.warn('API PDF extract failed:', apiErr)
      }

      try {
        const text = await extractPdfInBrowser(file)
        if (text.trim()) {
          onTextExtracted(text.trim())
          setFileName('')
          return
        }
        errors.push('Aucun texte détecté côté navigateur')
      } catch (browserErr) {
        const msg = browserErr instanceof Error ? browserErr.message : String(browserErr)
        errors.push(msg)
        console.warn('Browser PDF extract failed:', browserErr)
      }

      const joined = errors.filter(Boolean).join(' · ')
      setError(
        joined ||
          'Aucun texte détecté. Utilisez un PDF avec du vrai texte (pas un scan image).',
      )
    } catch (err) {
      console.error('PDF extraction error:', err)
      setError(err instanceof Error ? err.message : t.dashboard.uploadError)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <div
        className="border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center transition-all"
        style={{
          borderColor: dragOver ? 'var(--teal)' : 'rgba(91,164,176,0.35)',
          background: dragOver ? 'var(--teal-soft)' : 'var(--bg-soft)',
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) void processFile(file)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void processFile(file)
          }}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="space-y-2">
            <div
              className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(91,164,176,0.12)' }}
            >
              <svg className="h-6 w-6" stroke="var(--teal)" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-sm" style={{ color: 'var(--text-sub)' }}>
              {uploading ? (
                <div className="flex items-center justify-center gap-3">
                  <div
                    className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                    style={{ borderColor: 'var(--teal)', borderTopColor: 'transparent' }}
                  />
                  <span className="font-medium">
                    {t.dashboard.uploadProcessing} {fileName}...
                  </span>
                </div>
              ) : (
                <>
                  <span className="font-medium" style={{ color: 'var(--teal)' }}>
                    {t.dashboard.uploadClick}
                  </span>
                  <span> {t.dashboard.uploadDrag}</span>
                  <p className="text-xs mt-2 m-0" style={{ color: 'var(--text-sub)' }}>
                    {t.dashboard.uploadHint}
                  </p>
                </>
              )}
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div
          className="mt-4 p-4 rounded-2xl text-sm font-medium"
          style={{
            background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
            color: 'var(--danger)',
            border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
