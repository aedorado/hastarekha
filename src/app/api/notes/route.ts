import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface NoteItem {
  id: string;
  fileName: string;
  title: string;
  content: string;
}

interface NotesCache {
  etag: string;
  latestMtimeMs: number;
  notes: NoteItem[];
}

// In-memory cache holding serialized notes across requests
let memoryCache: NotesCache | null = null;

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

    const fileNames = fs
      .readdirSync(notesDirectory)
      .filter((fileName) => fileName.endsWith('.md'));

    // 1. Fast mtime check across disk files (stat only, 0 bytes file content read)
    let latestMtimeMs = 0;
    for (const fileName of fileNames) {
      const filePath = path.join(notesDirectory, fileName);
      try {
        const stat = fs.statSync(filePath);
        if (stat.mtimeMs > latestMtimeMs) {
          latestMtimeMs = stat.mtimeMs;
        }
      } catch {
        // file unlinked or inaccessible
      }
    }

    const etag = `"${fileNames.length}-${Math.round(latestMtimeMs)}"`;
    const clientEtag = request.headers.get('if-none-match');

    // 2. Immediate 304 response if client already has fresh data
    if (clientEtag && clientEtag === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }

    // 3. Serve from in-memory cache if nothing on disk has changed
    if (memoryCache && memoryCache.etag === etag) {
      return NextResponse.json(memoryCache.notes, {
        headers: {
          ETag: etag,
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    }

    // 4. Cache-miss: Read and parse files from disk once, then store in memory
    const notes: NoteItem[] = fileNames
      .map((fileName) => {
        const filePath = path.join(notesDirectory, fileName);
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
      .sort((a, b) => a.fileName.localeCompare(b.fileName));

    memoryCache = {
      etag,
      latestMtimeMs,
      notes,
    };

    return NextResponse.json(notes, {
      headers: {
        ETag: etag,
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error reading notes:', error);
    return NextResponse.json({ error: 'Failed to read notes' }, { status: 500 });
  }
}
