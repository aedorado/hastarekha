import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const notesDirectory = path.join(process.cwd(), 'notes');
    if (!fs.existsSync(notesDirectory)) {
      return NextResponse.json([], {
        headers: {
          'Cache-Control': 'no-cache, must-revalidate',
        },
      });
    }

    const fileNames = fs.readdirSync(notesDirectory);
    let latestMtimeMs = 0;

    const notes = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const filePath = path.join(notesDirectory, fileName);
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs > latestMtimeMs) {
          latestMtimeMs = stat.mtimeMs;
        }

        const content = fs.readFileSync(filePath, 'utf8');

        // Extract title from first line if it's # Title
        const lines = content.split('\n');
        const firstLine = lines.find((line) => line.trim().startsWith('# '));
        const title = firstLine
          ? firstLine.replace('# ', '').trim()
          : fileName.replace('.md', '');

        return {
          id: fileName,
          fileName,
          title,
          content,
        };
      })
      // Sort notes by file name (e.g. "01 - Intro.md" before "02...")
      .sort((a, b) => a.fileName.localeCompare(b.fileName));

    // Fast ETag based on count, file list hash, and latest file modification timestamp
    const etag = `"${notes.length}-${Math.round(latestMtimeMs)}"`;
    const clientEtag = request.headers.get('if-none-match');

    if (clientEtag && clientEtag === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }

    return NextResponse.json(notes, {
      headers: {
        ETag: etag,
        // max-age=0 + must-revalidate ensures browser/CDN revalidates with ETag instantly
        // If nothing changed, server sends tiny 304 (0 bytes transferred).
        // If you edited or pulled a note, you get fresh data immediately.
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error reading notes:', error);
    return NextResponse.json({ error: 'Failed to read notes' }, { status: 500 });
  }
}
