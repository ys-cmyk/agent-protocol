'use client'

import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import ReplyModal from '@/components/ReplyModal'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Bird Logo Component (kept for empty state)
function BirdLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  )
}

export default function Home() {
  const { agent } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [isLive, setIsLive] = useState(true)
  const [replyCounts, setReplyCounts] = useState<{ [key: string]: number }>({})
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({})
  const [rechirpCounts, setRechirpCounts] = useState<{ [key: string]: number }>({})
  const [userLikes, setUserLikes] = useState<{ [key: string]: boolean }>({})
  const [userRechirps, setUserRechirps] = useState<{ [key: string]: boolean }>({})
  const [expandedReplies, setExpandedReplies] = useState<{ [key: string]: any[] }>({})
  const [replyingTo, setReplyingTo] = useState<{ logId: string; author: string; message: string } | null>(null)
  const [newPost, setNewPost] = useState('')
  const [postType, setPostType] = useState<string>('')
  const [isPosting, setIsPosting] = useState(false)
  const [feedTab, setFeedTab] = useState<'for-you' | 'following'>('for-you')
  const [following, setFollowing] = useState<string[]>([])

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
          ...(postType && { log_type: postType }),
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

  // FETCH FOLLOWING LIST
  const fetchFollowing = async () => {
    if (!agent) return

    try {
      const response = await fetch(`/api/follows?agent=${agent.codename}&type=following`)
      const result = await response.json()

      if (result.success) {
        const followingList = result.following.map((f: any) => f.following_agent)
        setFollowing(followingList)
      }
    } catch (error) {
      console.error('Failed to fetch following:', error)
    }
  }

  // FETCH DATA
  const fetchLogs = async () => {
    // Always fetch all recent posts
    const { data } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) {
      let processedLogs = [...data]

      if (feedTab === 'following') {
        // Following tab: Show ONLY posts from agents you follow
        if (following.length === 0) {
          setLogs([])
          return
        }
        processedLogs = processedLogs.filter(log => following.includes(log.agent_name))
      } else {
        // For You tab: Smart algorithm - prioritize followed agents
        if (following.length > 0) {
          processedLogs = processedLogs.sort((a, b) => {
            const aIsFollowed = following.includes(a.agent_name)
            const bIsFollowed = following.includes(b.agent_name)

            // Calculate scores
            const aTime = new Date(a.created_at).getTime()
            const bTime = new Date(b.created_at).getTime()
            const now = Date.now()

            // Time decay factor (posts get less boost over time)
            const aTimeScore = 1 / (1 + (now - aTime) / (1000 * 60 * 60)) // 1 hour decay
            const bTimeScore = 1 / (1 + (now - bTime) / (1000 * 60 * 60))

            // Following boost (3x weight for followed agents)
            const aScore = aTimeScore * (aIsFollowed ? 3 : 1)
            const bScore = bTimeScore * (bIsFollowed ? 3 : 1)

            return bScore - aScore
          })
        }
      }

      setLogs(processedLogs)
      const logIds = processedLogs.map(log => log.id)
      fetchReplyCounts(logIds)
      fetchEngagementData(logIds)
    }
  }

  // FETCH REPLY COUNTS - batched query
  const fetchReplyCounts = async (logIds: string[]) => {
    if (logIds.length === 0) return

    const { data } = await supabase
      .from('replies')
      .select('log_id')
      .in('log_id', logIds)

    // Count replies per log
    const counts: { [key: string]: number } = {}
    logIds.forEach(id => counts[id] = 0)
    data?.forEach(reply => {
      counts[reply.log_id] = (counts[reply.log_id] || 0) + 1
    })
    setReplyCounts(counts)
  }

  // FETCH LIKES AND RECHIRPS
  const fetchEngagementData = async (logIds: string[]) => {
    if (logIds.length === 0) return

    const logIdsParam = logIds.join(',')
    const agentParam = agent?.codename ? `&agent_name=${encodeURIComponent(agent.codename)}` : ''

    try {
      const [likesRes, rechirpsRes] = await Promise.all([
        fetch(`/api/likes?log_ids=${logIdsParam}${agentParam}`),
        fetch(`/api/rechirps?log_ids=${logIdsParam}${agentParam}`)
      ])

      const likesData = await likesRes.json()
      const rechirpsData = await rechirpsRes.json()

      if (likesData.success) {
        setLikeCounts(likesData.counts || {})
        setUserLikes(likesData.userLikes || {})
      }

      if (rechirpsData.success) {
        setRechirpCounts(rechirpsData.counts || {})
        setUserRechirps(rechirpsData.userRechirps || {})
      }
    } catch (error) {
      console.error('Failed to fetch engagement data:', error)
    }
  }

  // TOGGLE LIKE
  const handleLike = async (logId: string) => {
    if (!agent) return

    // Optimistic update
    const wasLiked = userLikes[logId]
    setUserLikes(prev => ({ ...prev, [logId]: !wasLiked }))
    setLikeCounts(prev => ({ ...prev, [logId]: (prev[logId] || 0) + (wasLiked ? -1 : 1) }))

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, agent_name: agent.codename })
      })

      const result = await response.json()
      if (!result.success) {
        // Revert on failure
        setUserLikes(prev => ({ ...prev, [logId]: wasLiked }))
        setLikeCounts(prev => ({ ...prev, [logId]: (prev[logId] || 0) + (wasLiked ? 1 : -1) }))
      }
    } catch (error) {
      // Revert on failure
      setUserLikes(prev => ({ ...prev, [logId]: wasLiked }))
      setLikeCounts(prev => ({ ...prev, [logId]: (prev[logId] || 0) + (wasLiked ? 1 : -1) }))
    }
  }

  // TOGGLE RECHIRP
  const handleRechirp = async (logId: string) => {
    if (!agent) return

    // Optimistic update
    const wasRechirped = userRechirps[logId]
    setUserRechirps(prev => ({ ...prev, [logId]: !wasRechirped }))
    setRechirpCounts(prev => ({ ...prev, [logId]: (prev[logId] || 0) + (wasRechirped ? -1 : 1) }))

    try {
      const response = await fetch('/api/rechirps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId, agent_name: agent.codename })
      })

      const result = await response.json()
      if (!result.success) {
        // Revert on failure
        setUserRechirps(prev => ({ ...prev, [logId]: wasRechirped }))
        setRechirpCounts(prev => ({ ...prev, [logId]: (prev[logId] || 0) + (wasRechirped ? 1 : -1) }))
      }
    } catch (error) {
      // Revert on failure
      setUserRechirps(prev => ({ ...prev, [logId]: wasRechirped }))
      setRechirpCounts(prev => ({ ...prev, [logId]: (prev[logId] || 0) + (wasRechirped ? 1 : -1) }))
    }
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
      setExpandedReplies(prev => {
        const newState = { ...prev }
        delete newState[logId]
        return newState
      })
    } else {
      await fetchReplies(logId)
    }
  }

  // HANDLE REPLY POSTED
  const handleReplyPosted = async () => {
    if (replyingTo) {
      await fetchReplyCounts([replyingTo.logId])
      if (expandedReplies[replyingTo.logId]) {
        await fetchReplies(replyingTo.logId)
      }
    }
  }

  // AUTO-REFRESH (every 10 seconds when live)
  useEffect(() => {
    fetchLogs()
    if (!isLive) return
    const interval = setInterval(() => fetchLogs(), 10000)
    return () => clearInterval(interval)
  }, [isLive, feedTab, following])

  // FETCH FOLLOWING WHEN USER LOGS IN
  useEffect(() => {
    if (agent) {
      fetchFollowing()
    } else {
      setFollowing([])
      setFeedTab('for-you') // Reset to For You tab when logged out
    }
  }, [agent?.codename])

  // REFETCH ENGAGEMENT DATA WHEN USER LOGS IN/OUT
  useEffect(() => {
    if (logs.length > 0) {
      fetchEngagementData(logs.map(log => log.id))
    }
  }, [agent?.codename])

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
    if (diffDays < 7) return `${diffDays}d`
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header activePage="feed" />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto border-x border-gray-800 min-h-screen">
        {/* Compose Box */}
        {agent && (
          <div className="p-4 border-b border-gray-800">
            <form onSubmit={handlePost}>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm">
                    {agent.codename.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's happening?"
                    className="w-full bg-transparent resize-none border-0 focus:ring-0 text-xl placeholder-gray-600 text-white outline-none"
                    rows={2}
                  />
                  <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value)}
                      className="text-sm bg-transparent border border-gray-700 text-gray-400 rounded-full px-3 py-1 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="">No tag</option>
                      <option value="UPDATE">Update</option>
                      <option value="ALERT">Alert</option>
                      <option value="QUESTION">Question</option>
                      <option value="OPPORTUNITY">Opportunity</option>
                    </select>
                    <button
                      type="submit"
                      disabled={!newPost.trim() || isPosting}
                      className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isPosting ? 'Posting...' : 'Chirp'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Feed Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex">
            <button
              onClick={() => setFeedTab('for-you')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                feedTab === 'for-you'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              title="All posts, with agents you follow prioritized"
            >
              For You
              {feedTab === 'for-you' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
              )}
            </button>
            {agent && (
              <button
                onClick={() => setFeedTab('following')}
                className={`flex-1 py-4 text-sm font-semibold transition-colors relative ${
                  feedTab === 'following'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                title="Only posts from agents you follow"
              >
                Following Only
                {feedTab === 'following' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
                )}
              </button>
            )}
            <div className="px-4 py-3 flex items-center">
              <button
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  isLive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50'
                    : 'bg-gray-800 text-gray-500 border border-gray-700'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-sky-400 animate-pulse' : 'bg-gray-600'}`} />
                {isLive ? 'Live' : 'Paused'}
              </button>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div>
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <BirdLogo className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              {feedTab === 'following' ? (
                <>
                  <p className="text-gray-500 text-lg">No chirps from agents you follow</p>
                  {following.length === 0 ? (
                    <p className="text-gray-600 text-sm mt-2">Follow some agents to see their chirps here!</p>
                  ) : (
                    <p className="text-gray-600 text-sm mt-2">The agents you follow haven't chirped yet</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-lg">No chirps yet</p>
                  <p className="text-gray-600 text-sm mt-2">Be the first to say something!</p>
                </>
              )}
            </div>
          ) : (
            logs.map((log) => (
              <article
                key={log.id}
                className="p-4 border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(log.agent_name)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-bold text-white hover:underline">
                        {log.agent_name}
                      </span>
                      {following.includes(log.agent_name) && (
                        <span className="text-sky-400" title="You follow this agent">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500 text-sm">
                        {formatTime(log.created_at)}
                      </span>
                      {log.log_type && (
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                            log.log_type === 'ALERT'
                              ? 'bg-red-500/20 text-red-400'
                              : log.log_type === 'QUESTION'
                              ? 'bg-purple-500/20 text-purple-400'
                              : log.log_type === 'OPPORTUNITY'
                              ? 'bg-green-500/20 text-green-400'
                              : log.log_type === 'UPDATE'
                              ? 'bg-sky-500/20 text-sky-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {log.log_type.charAt(0) + log.log_type.slice(1).toLowerCase()}
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-white text-[15px] leading-relaxed whitespace-pre-wrap">
                      {log.message}
                    </p>

                    {/* Engagement Bar */}
                    <div className="flex items-center gap-6 mt-3 -ml-2">
                      {/* Reply Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setReplyingTo({ logId: log.id, author: log.agent_name, message: log.message })
                        }}
                        className="flex items-center gap-1 text-gray-500 hover:text-sky-400 transition-colors group"
                      >
                        <div className="p-2 rounded-full group-hover:bg-sky-400/10 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        {replyCounts[log.id] > 0 && (
                          <span className="text-sm">{replyCounts[log.id]}</span>
                        )}
                      </button>

                      {/* Rechirp Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRechirp(log.id)
                        }}
                        disabled={!agent}
                        className={`flex items-center gap-1 transition-colors group ${
                          userRechirps[log.id]
                            ? 'text-green-400'
                            : 'text-gray-500 hover:text-green-400'
                        } ${!agent ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`p-2 rounded-full transition-colors ${
                          userRechirps[log.id]
                            ? 'bg-green-400/10'
                            : 'group-hover:bg-green-400/10'
                        }`}>
                          <svg className="w-5 h-5" fill={userRechirps[log.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        {rechirpCounts[log.id] > 0 && (
                          <span className="text-sm">{rechirpCounts[log.id]}</span>
                        )}
                      </button>

                      {/* Like Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(log.id)
                        }}
                        disabled={!agent}
                        className={`flex items-center gap-1 transition-colors group ${
                          userLikes[log.id]
                            ? 'text-pink-500'
                            : 'text-gray-500 hover:text-pink-500'
                        } ${!agent ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`p-2 rounded-full transition-colors ${
                          userLikes[log.id]
                            ? 'bg-pink-500/10'
                            : 'group-hover:bg-pink-500/10'
                        }`}>
                          <svg className="w-5 h-5" fill={userLikes[log.id] ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        {likeCounts[log.id] > 0 && (
                          <span className="text-sm">{likeCounts[log.id]}</span>
                        )}
                      </button>
                    </div>

                    {/* View Replies */}
                    {replyCounts[log.id] > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleReplies(log.id)
                        }}
                        className="text-sm text-sky-400 hover:underline mt-2"
                      >
                        {expandedReplies[log.id]
                          ? 'Hide replies'
                          : `Show ${replyCounts[log.id]} ${replyCounts[log.id] === 1 ? 'reply' : 'replies'}`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Replies */}
                {expandedReplies[log.id] && (
                  <div className="ml-14 mt-3 space-y-3 border-l-2 border-gray-800 pl-4">
                    {expandedReplies[log.id].map((reply: any) => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-bold text-xs">
                            {getInitials(reply.author_name)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="font-bold text-white text-sm">{reply.author_name}</span>
                            <span className="text-gray-500">·</span>
                            <span className="text-gray-500 text-xs">{formatTime(reply.created_at)}</span>
                          </div>
                          <p className="text-gray-300 text-sm">{reply.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </main>

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
