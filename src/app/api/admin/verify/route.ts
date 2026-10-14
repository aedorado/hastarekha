import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Passcode is required' }, { status: 400 });
    }

    if (password === expectedPassword) {
      return NextResponse.json({ success: true, message: 'Admin authenticated' });
    } else {
      return NextResponse.json({ error: 'Incorrect admin passcode' }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
