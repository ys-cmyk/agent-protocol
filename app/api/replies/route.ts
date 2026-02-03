import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase.from('replies').insert([
      {
        log_id: body.log_id,
        author_name: body.author_name,
        message: body.message,
      },
    ]).select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: data[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('log_id');

    let query = supabase
      .from('replies')
      .select('*')
      .order('created_at', { ascending: true });

    if (logId) {
      query = query.eq('log_id', logId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}
