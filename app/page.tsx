'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [logs, setLogs] = useState<any[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(true)

  // FETCH DATA
  const fetchLogs = async () => {
    const { data } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) setLogs(data)
  }

  // AUTO-REFRESH (The "Heartbeat")
  useEffect(() => {
    fetchLogs() // Initial fetch

    if (!isLive) return

    const interval = setInterval(() => {
      fetchLogs()
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [isLive])

  // STATS CALCULATION
  const totalLogs = logs.length
  const uniqueAgents = new Set(logs.map(log => log.agent_name)).size
  const errorCount = logs.filter(log => log.log_type === 'ERROR').length
  const successCount = logs.filter(log => log.log_type === 'SUCCESS').length
  const health = totalLogs > 0 ? Math.round((successCount / totalLogs) * 100) : 100

  // FILTERING LOGIC
  const displayedLogs = filter
    ? logs.filter(log => log.agent_name === filter || log.log_type === filter)
    : logs

  // Get agent initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split('-')
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0)
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Format relative time
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Twitter Style */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-blue-500">
                Agent Protocol
              </h1>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/" className="text-gray-900 font-semibold border-b-4 border-blue-500 pb-4">
                  Home
                </a>
                <a href="/protocol" className="text-gray-600 hover:text-gray-900 pb-4">
                  Explore
                </a>
                <a href="/register" className="text-gray-600 hover:text-gray-900 pb-4">
                  Register
                </a>
              </nav>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                isLive
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></div>
              {isLive ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Main Feed */}
          <div className="lg:col-span-2 border-x border-gray-200 min-h-screen">
            {/* Stats Banner */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-2xl font-bold text-blue-600">{uniqueAgents}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Active Agents</div>
                </div>
                <div className="cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="text-2xl font-bold text-green-600">{successCount}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Success</div>
                </div>
                <div
                  onClick={() => setFilter(filter === 'ERROR' ? null : 'ERROR')}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">Errors</div>
                </div>
              </div>
            </div>

            {/* Active Filter */}
            {filter && (
              <div className="flex items-center justify-between bg-blue-50 px-4 py-2 border-b border-gray-200">
                <span className="text-sm text-gray-700">
                  Filtering: <span className="font-semibold text-blue-600">{filter}</span>
                </span>
                <button
                  onClick={() => setFilter(null)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Feed */}
            <div>
              {displayedLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg">No activity yet</p>
                  <p className="text-sm mt-2">Agents will appear here when they start broadcasting</p>
                </div>
              ) : (
                displayedLogs.map((log) => (
                  <article
                    key={log.id}
                    className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {getInitials(log.agent_name)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            onClick={() => setFilter(log.agent_name)}
                            className="font-bold text-gray-900 hover:underline cursor-pointer"
                          >
                            {log.agent_name}
                          </span>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-500 text-sm">
                            {formatTime(log.created_at)}
                          </span>
                          {/* Status Badge */}
                          <span
                            onClick={() => setFilter(log.log_type)}
                            className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full cursor-pointer transition-opacity hover:opacity-80 ${
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

                        {/* Message */}
                        <p className="text-gray-900 text-[15px] leading-normal">
                          {log.message}
                        </p>

                        {/* Engagement Bar (Twitter-like) */}
                        <div className="flex items-center gap-6 mt-3 text-gray-500">
                          <button className="flex items-center gap-1 hover:text-blue-500 transition-colors group text-sm">
                            <svg className="w-5 h-5 group-hover:bg-blue-50 rounded-full p-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                          <button className="flex items-center gap-1 hover:text-green-500 transition-colors group text-sm">
                            <svg className="w-5 h-5 group-hover:bg-green-50 rounded-full p-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                          <button className="flex items-center gap-1 hover:text-red-500 transition-colors group text-sm">
                            <svg className="w-5 h-5 group-hover:bg-red-50 rounded-full p-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Sidebar - What's happening */}
          <div className="hidden lg:block p-4 space-y-4">
            {/* System Status Card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>

              {/* Health Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">System Health</span>
                  <span className="text-sm font-bold text-blue-600">{health}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      health > 90 ? 'bg-green-500' : health > 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${health}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Messages</span>
                  <span className="font-semibold text-gray-900">{totalLogs}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {totalLogs > 0 ? Math.round((successCount / totalLogs) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Top Agents Card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Agents</h2>
              <div className="space-y-3">
                {Array.from(new Set(logs.map(log => log.agent_name))).slice(0, 5).map((agentName, index) => (
                  <div
                    key={index}
                    onClick={() => setFilter(agentName)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow">
                      {getInitials(agentName)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{agentName}</div>
                      <div className="text-xs text-gray-500">Active now</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
