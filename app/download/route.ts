import JSZip from 'jszip';
import type { NextRequest } from 'next/server';
import { blocks } from '@/lib/content';

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file');
  if (file) {
    const b = blocks.find((x) => x.file === file);
    if (!b) return new Response('Файл не найден', { status: 404 });
    return new Response(b.markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${b.file}"`,
      },
    });
  }
  const zip = new JSZip();
  const folder = zip.folder('design-basics')!;
  for (const b of blocks) folder.file(b.file, b.markdown);
  const data = await zip.generateAsync({ type: 'uint8array' });
  return new Response(data as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="design-basics.zip"',
    },
  });
}
