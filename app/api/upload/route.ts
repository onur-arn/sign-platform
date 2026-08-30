import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFParser = require('pdf2json');
    const parser = new PDFParser(null, 1);

    parser.on('pdfParser_dataReady', (data: any) => {
      try {
        const text = data.Pages
          .flatMap((page: any) => page.Texts)
          .map((t: any) => decodeURIComponent(t.R.map((r: any) => r.T).join('')))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        resolve(text);
      } catch {
        reject(new Error('Impossible de lire le contenu du PDF'));
      }
    });

    parser.on('pdfParser_dataError', (err: any) => {
      reject(new Error(err?.parserError || 'Erreur lors du parsing PDF'));
    });

    parser.parseBuffer(buffer);
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Le fichier ne doit pas dépasser 10 Mo' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPdf(buffer);

    if (!text) {
      return NextResponse.json({ error: 'Aucun texte détecté dans le PDF' }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Erreur extraction PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors du traitement du PDF' },
      { status: 500 }
    );
  }
}
