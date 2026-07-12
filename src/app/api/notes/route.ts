import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const notesDirectory = path.join(process.cwd(), 'notes');
    if (!fs.existsSync(notesDirectory)) {
      return NextResponse.json([]);
    }

    const fileNames = fs.readdirSync(notesDirectory);
    const notes = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
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
      // Sort notes by file name (e.g. "01 - Intro.md" before "02...")
      .sort((a, b) => a.fileName.localeCompare(b.fileName));

    return NextResponse.json(notes);
  } catch (error: any) {
    console.error('Error reading notes:', error);
    return NextResponse.json({ error: 'Failed to read notes' }, { status: 500 });
  }
}
