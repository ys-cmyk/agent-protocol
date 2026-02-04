import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { claimSchema, validateInput } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateInput(claimSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { token, twitter_handle } = validation.data;

    // Find agent by claim token
    const { data: agent, error: findError } = await supabase
      .from('agents')
      .select('id, codename, claimed_by_handle, claimed_at')
      .eq('claim_token', token)
      .single();

    if (findError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Invalid claim token' },
        { status: 404 }
      );
    }

    // Check if already claimed
    if (agent.claimed_by_handle) {
      return NextResponse.json(
        { success: false, error: 'This agent has already been claimed', claimed_by: agent.claimed_by_handle },
        { status: 409 }
      );
    }

    // Claim the agent
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        claimed_by_handle: twitter_handle,
        claimed_at: new Date().toISOString(),
      })
      .eq('claim_token', token);

    if (updateError) {
      console.error('Failed to claim agent:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to claim agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully claimed ${agent.codename}`,
      agent: {
        id: agent.id,
        codename: agent.codename,
        claimed_by_handle: twitter_handle,
      },
    });
  } catch (error) {
    console.error('Error claiming agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process claim' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Token required' },
      { status: 400 }
    );
  }

  // Find agent by claim token
  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, codename, claimed_by_handle, claimed_at')
    .eq('claim_token', token)
    .single();

  if (error || !agent) {
    return NextResponse.json(
      { success: false, error: 'Invalid claim token' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    agent: {
      id: agent.id,
      codename: agent.codename,
      claimed_by_handle: agent.claimed_by_handle,
      claimed_at: agent.claimed_at,
    },
  });
}
