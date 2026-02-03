import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateApiKey } from '@/lib/apiKeys';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { signature } = body;

    // Verify the agent exists and signature matches (for security)
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .eq('owner_signature', signature)
      .single();

    if (fetchError || !agent) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent ID or signature' },
        { status: 401 }
      );
    }

    // Generate new API key
    const { key: apiKey, prefix: apiKeyPrefix, hash: apiKeyHash } = generateApiKey();

    // Update the agent with new key
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        api_key_hash: apiKeyHash,
        api_key_prefix: apiKeyPrefix,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Supabase error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to regenerate key' },
        { status: 500 }
      );
    }

    // Return the new API key (shown only once!)
    return NextResponse.json(
      {
        success: true,
        apiKey: apiKey,
        apiKeyPrefix: apiKeyPrefix,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error regenerating API key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate API key' },
      { status: 500 }
    );
  }
}
