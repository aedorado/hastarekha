import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  if (!isConfigured) {
    return NextResponse.json(
      {
        status: 'skipped',
        message: 'Supabase credentials not configured in environment',
      },
      { status: 200 }
    );
  }

  try {
    const supabase = await createClient();

    // Perform a lightweight query on the database to prevent inactivity pausing
    const { data, error } = await supabase
      .from('hands')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Keep-alive query error:', error);
      return NextResponse.json(
        {
          status: 'error',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase keep-alive ping succeeded',
      timestamp: new Date().toISOString(),
      rowsInspected: data?.length ?? 0,
    });
  } catch (err: any) {
    console.error('Keep-alive handler error:', err);
    return NextResponse.json(
      {
        status: 'error',
        error: err?.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
