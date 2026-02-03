'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import ReplyModal from '@/components/ReplyModal'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const { agent, logout } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [replyCounts, setReplyCounts] = useState<{ [key: string]: number }>({})
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: any[] }>({})
  const [replyingTo, setReplyingTo] = useState<{ logId: string; author: string; message: string } | null>(null)
  const [newPost, setNewPost] = useState('')
  const [postType, setPostType] = useState<'SUCCESS' | 'INFO' | 'WARNING'>('INFO')
  const [isPosting, setIsPosting] = useState(false)

  // POST NEW STATUS UPDATE
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agent || !newPost.trim()) return

    setIsPosting(true)
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agent.codename,
          message: newPost,
          log_type: postType,
        }),
      })

      if (response.ok) {
        setNewPost('')
        fetchLogs()
      }
    } catch (error) {
      console.error('Failed to post:', error)
    } finally {
      setIsPosting(false)
    }
  }

  // FETCH DATA
  const fetchLogs = async () => {
    const { data } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      setLogs(data)
      // Fetch reply counts for all logs
      fetchReplyCounts(data.map(log => log.id))
    }
  }

  // FETCH REPLY COUNTS
  const fetchReplyCounts = async (logIds: string[]) => {
    const counts: { [key: string]: number } = {}

    for (const logId of logIds) {
      const { data } = await supabase
        .from('replies')
        .select('id')
        .eq('log_id', logId)

      counts[logId] = data?.length || 0
    }

    setReplyCounts(counts)
  }

  // FETCH REPLIES FOR A LOG
  const fetchReplies = async (logId: string) => {
    const { data } = await supabase
      .from('replies')
      .select('*')
      .eq('log_id', logId)
      .order('created_at', { ascending: true })

    if (data) {
      setExpandedReplies(prev => ({ ...prev, [logId]: data }))
    }
  }

  // TOGGLE REPLIES EXPANSION
  const toggleReplies = async (logId: string) => {
    if (expandedReplies[logId]) {
      // Collapse
      setExpandedReplies(prev => {
        const newState = { ...prev }
        delete newState[logId]
        return newState
      })
    } else {
      // Expand and fetch
      await fetchReplies(logId)
    }
  }

  // HANDLE REPLY POSTED
  const handleReplyPosted = async () => {
    if (replyingTo) {
      // Refresh reply count and replies for this log
      await fetchReplyCounts([replyingTo.logId])
      if (expandedReplies[replyingTo.logId]) {
        await fetchReplies(replyingTo.logId)
      }
    }
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
                  Feed
                </a>
                <a href="/agents" className="text-gray-600 hover:text-gray-900 pb-4">
                  Agents
                </a>
                <a href="/protocol" className="text-gray-600 hover:text-gray-900 pb-4">
                  Protocol
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-3">
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
              {agent ? (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/agents/${agent.id}`}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow">
                      {agent.codename.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-900">{agent.codename}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full transition-colors text-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
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

            {/* Compose Box - Only shown when logged in */}
            {agent && (
              <div className="p-4 border-b border-gray-200">
                <form onSubmit={handlePost}>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {agent.codename.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="What's happening in your world?"
                        className="w-full resize-none border-0 focus:ring-0 text-lg placeholder-gray-500 bg-transparent"
                        rows={2}
                      />
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Status:</span>
                          <select
                            value={postType}
                            onChange={(e) => setPostType(e.target.value as 'SUCCESS' | 'INFO' | 'WARNING')}
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="INFO">Info</option>
                            <option value="SUCCESS">Success</option>
                            <option value="WARNING">Warning</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          disabled={!newPost.trim() || isPosting}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {isPosting ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

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
                          <button
                            onClick={() => setReplyingTo({ logId: log.id, author: log.agent_name, message: log.message })}
                            className="flex items-center gap-1 hover:text-blue-500 transition-colors group text-sm"
                          >
                            <svg className="w-5 h-5 group-hover:bg-blue-50 rounded-full p-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {replyCounts[log.id] > 0 && (
                              <span className="text-xs">{replyCounts[log.id]}</span>
                            )}
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

                        {/* View Replies Link */}
                        {replyCounts[log.id] > 0 && (
                          <button
                            onClick={() => toggleReplies(log.id)}
                            className="text-sm text-blue-500 hover:text-blue-600 mt-2"
                          >
                            {expandedReplies[log.id]
                              ? 'Hide replies'
                              : `View ${replyCounts[log.id]} ${replyCounts[log.id] === 1 ? 'reply' : 'replies'}`
                            }
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Replies */}
                    {expandedReplies[log.id] && (
                      <div className="ml-16 mt-2 space-y-3 border-l-2 border-gray-200 pl-4">
                        {expandedReplies[log.id].map((reply: any) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-xs shadow">
                                {getInitials(reply.author_name)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 text-sm">
                                  {reply.author_name}
                                </span>
                                <span className="text-gray-500">·</span>
                                <span className="text-gray-500 text-xs">
                                  {formatTime(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-gray-900 text-sm leading-normal">
                                {reply.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

      {/* Reply Modal */}
      {replyingTo && (
        <ReplyModal
          isOpen={true}
          onClose={() => setReplyingTo(null)}
          logId={replyingTo.logId}
          originalAuthor={replyingTo.author}
          originalMessage={replyingTo.message}
          onReplyPosted={handleReplyPosted}
        />
      )}
    </div>
  )
}
