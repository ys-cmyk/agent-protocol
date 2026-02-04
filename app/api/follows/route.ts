import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verifyApiKey } from '@/lib/apiKeys'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

// Toggle follow on an agent
export async function POST(request: NextRequest) {
  // Rate limit: 30 follows per minute
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.post, 'follows')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')
    const { following_agent } = body

    if (!following_agent) {
      return NextResponse.json(
        { success: false, error: 'following_agent is required' },
        { status: 400 }
      )
    }

    let followerAgent: string

    // Check for API key authentication (for bots)
    if (authHeader) {
      const authResult = await verifyApiKey(authHeader)
      if (!authResult.valid) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed' },
          { status: 401 }
        )
      }
      followerAgent = authResult.agent.codename
    } else if (body.follower_agent) {
      // Fallback for web UI - validate agent exists
      const { data: agent } = await supabase
        .from('agents')
        .select('codename')
        .eq('codename', body.follower_agent)
        .single()

      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Invalid agent' },
          { status: 401 }
        )
      }
      followerAgent = body.follower_agent
    } else {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Prevent self-following
    if (followerAgent === following_agent) {
      return NextResponse.json(
        { success: false, error: 'Cannot follow yourself' },
        { status: 403 }
      )
    }

    // Check if target agent exists
    const { data: targetAgent } = await supabase
      .from('agents')
      .select('codename')
      .eq('codename', following_agent)
      .single()

    if (!targetAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_agent', followerAgent)
      .eq('following_agent', following_agent)
      .single()

    if (existing) {
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .eq('follower_agent', followerAgent)
        .eq('following_agent', following_agent)

      return NextResponse.json({ success: true, action: 'unfollowed' })
    } else {
      // Follow
      const { error } = await supabase
        .from('follows')
        .insert({ follower_agent: followerAgent, following_agent })

      if (error) {
        console.error('Follow insert error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to follow' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, action: 'followed' })
    }
  } catch (error) {
    console.error('Follow toggle error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle follow' },
      { status: 500 }
    )
  }
}

// Get follow status and counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const agent = searchParams.get('agent')
    const currentAgent = searchParams.get('current_agent')
    const type = searchParams.get('type') // 'followers' | 'following' | 'status'

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'agent parameter is required' },
        { status: 400 }
      )
    }

    if (type === 'followers') {
      // Get list of followers
      const { data, error } = await supabase
        .from('follows')
        .select('follower_agent, created_at')
        .eq('following_agent', agent)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        followers: data || [],
        count: data?.length || 0
      })
    } else if (type === 'following') {
      // Get list of following
      const { data, error } = await supabase
        .from('follows')
        .select('following_agent, created_at')
        .eq('follower_agent', agent)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        following: data || [],
        count: data?.length || 0
      })
    } else {
      // Get follow status and counts
      const [followersResult, followingResult] = await Promise.all([
        supabase
          .from('follows')
          .select('follower_agent')
          .eq('following_agent', agent),
        supabase
          .from('follows')
          .select('following_agent')
          .eq('follower_agent', agent)
      ])

      const followers = followersResult.data || []
      const following = followingResult.data || []

      // Check if current agent follows this agent
      let isFollowing = false
      if (currentAgent) {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_agent', currentAgent)
          .eq('following_agent', agent)
          .single()

        isFollowing = !!data
      }

      return NextResponse.json({
        success: true,
        followersCount: followers.length,
        followingCount: following.length,
        isFollowing
      })
    }
  } catch (error) {
    console.error('Fetch follows error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch follows' },
      { status: 500 }
    )
  }
}