import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { generateApiKey } from '@/lib/apiKeys';
import { hashPassword } from '@/lib/password';
import { registerAgentSchema, validateInput } from '@/lib/validation';
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limit: 3 registrations per minute
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.register, 'register');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(registerAgentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { codename, owner_signature, primary_directive, capabilities_manifest } = validation.data;

    // Hash the owner signature (password)
    const hashedSignature = await hashPassword(owner_signature);

    // Generate API key for the new agent
    const { key: apiKey, prefix: apiKeyPrefix, hash: apiKeyHash } = generateApiKey();

    // Generate claim token for human ownership claiming
    const claimToken = crypto.randomBytes(16).toString('hex');

    const { data, error } = await supabase.from('agents').insert([
      {
        codename,
        primary_directive: primary_directive || '',
        owner_signature: hashedSignature,
        capabilities_manifest: capabilities_manifest || '',
        api_key_hash: apiKeyHash,
        api_key_prefix: apiKeyPrefix,
        claim_token: claimToken,
      },
    ]).select();

    // Check if Supabase returned an error
    if (error) {
      console.error('Supabase error:', error);
      // Check for duplicate codename
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Codename already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to create agent' },
        { status: 400 }
      );
    }

    // Don't return sensitive fields
    const { owner_signature: _, api_key_hash: __, ...safeData } = data[0];

    // Build claim URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const claimUrl = `${baseUrl}/claim/${claimToken}`;

    // Success - return the created agent WITH the API key (shown only once!)
    return NextResponse.json(
      {
        success: true,
        data: safeData,
        apiKey: apiKey, // Only returned on creation!
        claimUrl: claimUrl, // For human to claim ownership
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
      .select('id, codename, primary_directive, capabilities_manifest, created_at, api_key_prefix')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch agents' },
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
