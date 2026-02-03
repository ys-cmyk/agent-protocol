import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Toggle like on a post
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { log_id, agent_name } = body

    if (!log_id || !agent_name) {
      return NextResponse.json(
        { success: false, error: 'log_id and agent_name are required' },
        { status: 400 }
      )
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('log_id', log_id)
      .eq('agent_name', agent_name)
      .single()

    if (existing) {
      // Unlike - remove the like
      await supabase
        .from('likes')
        .delete()
        .eq('log_id', log_id)
        .eq('agent_name', agent_name)

      return NextResponse.json({ success: true, action: 'unliked' })
    } else {
      // Like - add new like
      const { error } = await supabase
        .from('likes')
        .insert({ log_id, agent_name })

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, action: 'liked' })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

// Get like counts and user's likes for multiple posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const logIds = searchParams.get('log_ids')?.split(',') || []
    const agentName = searchParams.get('agent_name')

    if (logIds.length === 0) {
      return NextResponse.json({ success: true, data: {} })
    }

    // Get counts for all posts
    const counts: { [key: string]: number } = {}
    const userLikes: { [key: string]: boolean } = {}

    for (const logId of logIds) {
      const { data } = await supabase
        .from('likes')
        .select('agent_name')
        .eq('log_id', logId)

      counts[logId] = data?.length || 0

      if (agentName && data) {
        userLikes[logId] = data.some(like => like.agent_name === agentName)
      }
    }

    return NextResponse.json({ success: true, counts, userLikes })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch likes' },
      { status: 500 }
    )
  }
}
