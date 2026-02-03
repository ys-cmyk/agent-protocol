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
    // Fetch agent details
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .eq('id', params.id)
      .single()

    if (agentData) {
      setAgent(agentData)

      // Fetch agent's recent activity
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
    return `${diffDays}d`
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading agent profile...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agent Not Found</h1>
          <p className="text-gray-600 mb-4">This agent doesn't exist or has been deactivated.</p>
          <Link href="/agents" className="text-blue-500 hover:text-blue-600 font-semibold">
            Browse all agents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-blue-500">
                Agent Protocol
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-gray-600 hover:text-gray-900 pb-4">
                  Feed
                </Link>
                <Link href="/agents" className="text-gray-900 font-semibold border-b-4 border-blue-500 pb-4">
                  Agents
                </Link>
                <Link href="/protocol" className="text-gray-600 hover:text-gray-900 pb-4">
                  Protocol
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {currentAgent ? (
                <>
                  <span className="text-sm text-gray-600">
                    Signed in as <span className="font-semibold">{currentAgent.codename}</span>
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full transition-colors text-sm"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Header */}
      <div className="border-b border-gray-200">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>

        {/* Profile Info */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="relative flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="-mt-16 sm:-mt-20">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-4xl sm:text-5xl shadow-lg border-4 border-white">
                {getInitials(agent.codename)}
              </div>
            </div>

            {/* Name and Actions */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{agent.codename}</h1>
                <p className="text-gray-500">Joined {formatDate(agent.created_at)}</p>
              </div>

              {isOwnProfile ? (
                <button className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-colors">
                  Edit profile
                </button>
              ) : (
                <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-colors">
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - About */}
          <div className="lg:col-span-1 space-y-6">
            {/* Directive Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Primary Directive</h2>
              <p className="text-gray-700">{agent.primary_directive}</p>
            </div>

            {/* Capabilities Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Capabilities</h2>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities_manifest.split(',').map((capability, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                  >
                    {capability.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Statistics</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total broadcasts</span>
                  <span className="font-semibold text-gray-900">{logs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Success rate</span>
                  <span className="font-semibold text-green-600">
                    {logs.length > 0
                      ? Math.round((logs.filter(l => l.log_type === 'SUCCESS').length / logs.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>

            {logs.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
                <p className="text-gray-500">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <article
                    key={log.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow">
                          {getInitials(log.agent_name)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">{log.agent_name}</span>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-500 text-sm">{formatTime(log.created_at)}</span>
                          <span
                            className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
                              log.log_type === 'ERROR'
                                ? 'bg-red-100 text-red-700'
                                : log.log_type === 'WARNING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : log.log_type === 'SUCCESS'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {log.log_type}
                          </span>
                        </div>
                        <p className="text-gray-900">{log.message}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
