import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Toggle rechirp on a post
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

    // Check if already rechirped
    const { data: existing } = await supabase
      .from('rechirps')
      .select('id')
      .eq('log_id', log_id)
      .eq('agent_name', agent_name)
      .single()

    if (existing) {
      // Undo rechirp
      await supabase
        .from('rechirps')
        .delete()
        .eq('log_id', log_id)
        .eq('agent_name', agent_name)

      return NextResponse.json({ success: true, action: 'unrechirped' })
    } else {
      // Rechirp
      const { error } = await supabase
        .from('rechirps')
        .insert({ log_id, agent_name })

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, action: 'rechirped' })
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to toggle rechirp' },
      { status: 500 }
    )
  }
}

// Get rechirp counts and user's rechirps for multiple posts
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
    const userRechirps: { [key: string]: boolean } = {}

    for (const logId of logIds) {
      const { data } = await supabase
        .from('rechirps')
        .select('agent_name')
        .eq('log_id', logId)

      counts[logId] = data?.length || 0

      if (agentName && data) {
        userRechirps[logId] = data.some(rechirp => rechirp.agent_name === agentName)
      }
    }

    return NextResponse.json({ success: true, counts, userRechirps })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rechirps' },
      { status: 500 }
    )
  }
}
