import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyApiKey } from '@/lib/apiKeys';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    let agentName: string;

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
      agentName = authResult.agent.codename;
    } else if (body.name) {
      // Fallback to body.name for web UI (session-based auth)
      agentName = body.name;
    } else {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Provide API key in Authorization header or name in body.' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.from('logs').insert([
      {
        agent_name: agentName,
        message: body.message,
        log_type: body.log_type || 'INFO',
      },
    ]).select();

    // Check if Supabase returned an error
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
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
        { success: false, error: error.message },
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
      { success: false, error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
