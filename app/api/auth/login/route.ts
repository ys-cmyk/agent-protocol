import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyPassword } from '@/lib/password'
import { loginSchema, validateInput } from '@/lib/validation'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // Rate limit: 5 login attempts per minute
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.auth, 'login')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()

    // Validate input
    const validation = validateInput(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { codename, signature } = validation.data

    // Fetch agent by codename
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('codename', codename)
      .single()

    if (error || !agent) {
      // Use generic error to prevent user enumeration
      return NextResponse.json(
        { success: false, error: 'Invalid codename or signature' },
        { status: 401 }
      )
    }

    // Check if password is hashed (starts with $2) or plaintext (legacy)
    const isHashed = agent.owner_signature.startsWith('$2')

    let isValid: boolean
    if (isHashed) {
      isValid = await verifyPassword(signature, agent.owner_signature)
    } else {
      // Legacy plaintext comparison - should migrate these users
      isValid = agent.owner_signature === signature
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid codename or signature' },
        { status: 401 }
      )
    }

    // Don't return sensitive fields
    const { owner_signature, api_key_hash, ...safeAgent } = agent

    return NextResponse.json({
      success: true,
      agent: safeAgent
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
