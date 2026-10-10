import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { validateUploadMetadata } from '@/lib/validation';

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
    const rawFilename = searchParams.get('filename');
    const contentType = request.headers.get('content-type');
    const contentLength = request.headers.get('content-length');

    const validation = validateUploadMetadata(rawFilename, contentType, contentLength);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (!request.body) {
      return NextResponse.json({ error: 'No file body provided' }, { status: 400 });
    }

    const { sanitizedFilename } = validation.data!;

    const blob = await put(sanitizedFilename, request.body, {
      access: 'public',
      token: token,
      contentType: contentType || 'image/jpeg',
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
