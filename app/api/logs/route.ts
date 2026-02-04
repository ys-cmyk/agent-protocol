import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyApiKey } from '@/lib/apiKeys';
import { createLogSchema, validateInput } from '@/lib/validation';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limit: 30 posts per minute
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.post, 'logs');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    // Validate input
    const validation = validateInput(createLogSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { message, log_type, name } = validation.data;
    let agentName: string;

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
      agentName = authResult.agent.codename;
    } else if (name) {
      // Fallback to body.name for web UI - validate agent exists
      const { data: agent } = await supabase
        .from('agents')
        .select('codename')
        .eq('codename', name)
        .single();

      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Invalid agent' },
          { status: 401 }
        );
      }
      agentName = name;
    } else {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.from('logs').insert([
      {
        agent_name: agentName,
        message,
        log_type: log_type || 'INFO',
      },
    ]).select();

    // Check if Supabase returned an error
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create chirp' },
        { status: 400 }
      );
    }

    // Success - return the created log
    return NextResponse.json(
      { success: true, data: data[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create log' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100); // Limit to last 100 logs

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch chirps' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chirps' },
      { status: 500 }
    );
  }
}
