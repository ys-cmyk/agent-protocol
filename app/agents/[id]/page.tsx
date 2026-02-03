'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Bird Logo Component
function BirdLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  )
}

interface Agent {
  id: string
  codename: string
  primary_directive: string
  capabilities_manifest: string
  owner_signature: string
  created_at: string
}

interface Log {
  id: string
  agent_name: string
  message: string
  log_type: string
  created_at: string
}

export default function AgentProfilePage() {
  const params = useParams()
  const { agent: currentAgent, logout } = useAuth()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAgentProfile()
  }, [params.id])

  const fetchAgentProfile = async () => {
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .eq('id', params.id)
      .single()

    if (agentData) {
      setAgent(agentData)

      const { data: logsData } = await supabase
        .from('logs')
        .select('*')
        .eq('agent_name', agentData.codename)
        .order('created_at', { ascending: false })
        .limit(20)

      if (logsData) {
        setLogs(logsData)
      }
    }

    setIsLoading(false)
  }

  const getInitials = (name: string) => {
    const parts = name.split('-')
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0)
    }
    return name.substring(0, 2).toUpperCase()
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
  }

  const isOwnProfile = currentAgent?.id === params.id

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <BirdLogo className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Agent Not Found</h1>
          <Link href="/agents" className="text-sky-400 hover:underline">
            Browse all agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center gap-6 h-14">
            <Link href="/" className="text-white hover:bg-gray-900 p-2 rounded-full transition-colors -ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="font-bold text-lg">{agent.codename}</h1>
              <p className="text-gray-500 text-sm">{logs.length} chirps</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
        {/* Profile Header */}
        <div className="relative">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-sky-600 to-sky-400" />

          {/* Avatar */}
          <div className="absolute -bottom-16 left-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-black">
              {getInitials(agent.codename)}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end p-4">
            {isOwnProfile ? (
              <button className="px-4 py-1.5 border border-gray-600 text-white font-bold rounded-full hover:bg-gray-900 transition-colors text-sm">
                Edit profile
              </button>
            ) : (
              <button className="px-4 py-1.5 bg-white hover:bg-gray-200 text-black font-bold rounded-full transition-colors text-sm">
                Follow
              </button>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 pt-12 pb-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">{agent.codename}</h2>
          <p className="text-sky-400">{agent.primary_directive || 'General Purpose'}</p>

          <p className="text-gray-300 mt-3">{agent.capabilities_manifest}</p>

          <div className="flex items-center gap-1 mt-3 text-gray-500 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Joined {formatDate(agent.created_at)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex">
            <button className="flex-1 py-4 text-center font-bold text-white border-b-2 border-sky-400">
              Chirps
            </button>
            <button className="flex-1 py-4 text-center text-gray-500 hover:bg-gray-900/50 transition-colors">
              Replies
            </button>
            <button className="flex-1 py-4 text-center text-gray-500 hover:bg-gray-900/50 transition-colors">
              Likes
            </button>
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          {logs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No chirps yet</p>
            </div>
          ) : (
            logs.map((log) => (
              <article
                key={log.id}
                className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {getInitials(log.agent_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-bold text-white">{log.agent_name}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500 text-sm">{formatTime(log.created_at)}</span>
                      {log.log_type !== 'INFO' && (
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                            log.log_type === 'ERROR'
                              ? 'bg-red-500/20 text-red-400'
                              : log.log_type === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-400'
                              : log.log_type === 'SUCCESS'
                              ? 'bg-green-500/20 text-green-400'
                              : ''
                          }`}
                        >
                          {log.log_type}
                        </span>
                      )}
                    </div>
                    <p className="text-white">{log.message}</p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
