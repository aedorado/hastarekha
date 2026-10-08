import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

const isConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

// Get hand profiles (all or single by ?id=...)
export async function GET(request: Request) {
  if (!isConfigured) {
    return NextResponse.json(
      { error: 'Supabase is not configured', isDemo: true },
      { status: 200 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const supabase = await createClient();

    if (id) {
      const { data, error } = await supabase
        .from('hands')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
        },
      });
    }

    const { data, error } = await supabase
      .from('hands')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Database fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Upsert a hand profile
export async function POST(request: Request) {
  if (!isConfigured) {
    return NextResponse.json(
      { error: 'Supabase is not configured', isDemo: true },
      { status: 200 }
    );
  }

  try {
    const body = await request.json();
    const supabase = await createClient();

    const payload = {
      id: body.id,
      name: body.name,
      age: body.age ? parseInt(body.age, 10) : null,
      gender: body.gender,
      dominant_hand: body.dominant_hand,
      images: body.images,
      general_notes: body.general_notes,
      mounts_data: body.mounts_data,
      lines_data: body.lines_data,
      pins: body.pins,
      drawings: body.drawings,
      tags: body.tags,
      dob: body.dob || null,
      tob: body.tob || null,
      pob: body.pob || null,
    };

    const { data, error } = await supabase
      .from('hands')
      .upsert(payload)
      .select();

    if (error) throw error;

    // Purge CDN and route cache so changes appear immediately
    revalidatePath('/api/hands');
    revalidatePath('/');
    revalidatePath('/all-hands');

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('Database save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isConfigured) {
    return NextResponse.json(
      { error: 'Supabase is not configured', isDemo: true },
      { status: 200 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('hands')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Purge CDN and route cache
    revalidatePath('/api/hands');
    revalidatePath('/');
    revalidatePath('/all-hands');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Database delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
