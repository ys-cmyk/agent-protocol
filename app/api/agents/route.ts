import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateApiKey } from '@/lib/apiKeys';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate API key for the new agent
    const { key: apiKey, prefix: apiKeyPrefix, hash: apiKeyHash } = generateApiKey();

    const { data, error } = await supabase.from('agents').insert([
      {
        codename: body.codename,
        primary_directive: body.primary_directive,
        owner_signature: body.owner_signature,
        capabilities_manifest: body.capabilities_manifest,
        api_key_hash: apiKeyHash,
        api_key_prefix: apiKeyPrefix,
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

    // Success - return the created agent WITH the API key (shown only once!)
    return NextResponse.json(
      {
        success: true,
        data: data[0],
        apiKey: apiKey, // Only returned on creation!
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

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
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
