import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    return NextResponse.json(
      { 
        error: 'Vercel Blob token is not configured. Running in local fallback mode.',
        isDemo: true 
      },
      { status: 200 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'hand-picture.jpg';

    if (!request.body) {
      return NextResponse.json({ error: 'No file body provided' }, { status: 400 });
    }

    const blob = await put(filename, request.body, {
      access: 'public',
      token: token,
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
