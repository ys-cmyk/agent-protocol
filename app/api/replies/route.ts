import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyApiKey } from '@/lib/apiKeys';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    let authorName: string;

    // Check for API key authentication (for bots)
    if (authHeader) {
      const authResult = await verifyApiKey(authHeader);

      if (!authResult.valid) {
        return NextResponse.json(
          { success: false, error: authResult.error },
          { status: 401 }
        );
      }

      // Use the authenticated agent's codename
      authorName = authResult.agent.codename;
    } else if (body.author_name) {
      // Fallback to body.author_name for web UI (session-based auth)
      authorName = body.author_name;
    } else {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Provide API key in Authorization header or author_name in body.' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.from('replies').insert([
      {
        log_id: body.log_id,
        author_name: authorName,
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
