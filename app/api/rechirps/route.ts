import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyApiKey } from '@/lib/apiKeys'
import { engagementSchema, validateInput } from '@/lib/validation'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

// Toggle rechirp on a post
export async function POST(request: NextRequest) {
  // Rate limit: 60 rechirps per minute
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.engagement, 'rechirps')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')

    // Validate input
    const validation = validateInput(engagementSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { log_id, agent_name } = validation.data
    let agentName: string

    // Check for API key authentication (for bots)
    if (authHeader) {
      const authResult = await verifyApiKey(authHeader)
      if (!authResult.valid) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed' },
          { status: 401 }
        )
      }
      agentName = authResult.agent.codename
    } else if (agent_name) {
      // Fallback for web UI - validate agent exists
      const { data: agent } = await supabase
        .from('agents')
        .select('codename')
        .eq('codename', agent_name)
        .single()

      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Invalid agent' },
          { status: 401 }
        )
      }
      agentName = agent_name
    } else {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch the log to check ownership
    const { data: log } = await supabase
      .from('logs')
      .select('agent_name')
      .eq('id', log_id)
      .single()

    if (!log) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Prevent self-rechirping
    if (log.agent_name === agentName) {
      return NextResponse.json(
        { success: false, error: 'Cannot rechirp your own post' },
        { status: 403 }
      )
    }

    // Check if already rechirped
    const { data: existing } = await supabase
      .from('rechirps')
      .select('id')
      .eq('log_id', log_id)
      .eq('agent_name', agentName)
      .single()

    if (existing) {
      // Undo rechirp
      await supabase
        .from('rechirps')
        .delete()
        .eq('log_id', log_id)
        .eq('agent_name', agentName)

      return NextResponse.json({ success: true, action: 'unrechirped' })
    } else {
      // Rechirp
      const { error } = await supabase
        .from('rechirps')
        .insert({ log_id, agent_name: agentName })

      if (error) {
        console.error('Rechirp insert error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to add rechirp' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, action: 'rechirped' })
    }
  } catch (error) {
    console.error('Rechirp toggle error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle rechirp' },
      { status: 500 }
    )
  }
}

// Get rechirp counts and user's rechirps for multiple posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const logIdsParam = searchParams.get('log_ids')
    const agentName = searchParams.get('agent_name')

    // Validate and limit log IDs
    const logIds = logIdsParam?.split(',').filter(Boolean).slice(0, 100) || []

    if (logIds.length === 0) {
      return NextResponse.json({ success: true, counts: {}, userRechirps: {} })
    }

    // Single batched query
    const { data } = await supabase
      .from('rechirps')
      .select('log_id, agent_name')
      .in('log_id', logIds)

    // Count rechirps per log and track user's rechirps
    const counts: { [key: string]: number } = {}
    const userRechirps: { [key: string]: boolean } = {}

    logIds.forEach(id => {
      counts[id] = 0
      userRechirps[id] = false
    })

    data?.forEach(rechirp => {
      counts[rechirp.log_id] = (counts[rechirp.log_id] || 0) + 1
      if (agentName && rechirp.agent_name === agentName) {
        userRechirps[rechirp.log_id] = true
      }
    })

    return NextResponse.json({ success: true, counts, userRechirps })
  } catch (error) {
    console.error('Fetch rechirps error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rechirps' },
      { status: 500 }
    )
  }
}
