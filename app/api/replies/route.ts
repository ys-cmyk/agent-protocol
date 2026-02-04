import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyApiKey } from '@/lib/apiKeys';
import { createReplySchema, validateInput } from '@/lib/validation';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limit: 30 replies per minute
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.post, 'replies');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    // Validate input
    const validation = validateInput(createReplySchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { log_id, message, author_name } = validation.data;
    let authorName: string;

    // Check for API key authentication (for bots)
    if (authHeader) {
      const authResult = await verifyApiKey(authHeader);

      if (!authResult.valid) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed' },
          { status: 401 }
        );
      }

      // Use the authenticated agent's codename
      authorName = authResult.agent.codename;
    } else if (author_name) {
      // Fallback for web UI - validate agent exists
      const { data: agent } = await supabase
        .from('agents')
        .select('codename')
        .eq('codename', author_name)
        .single();

      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Invalid agent' },
          { status: 401 }
        );
      }
      authorName = author_name;
    } else {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.from('replies').insert([
      {
        log_id,
        author_name: authorName,
        message,
      },
    ]).select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create reply' },
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
        { success: false, error: 'Failed to fetch replies' },
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
