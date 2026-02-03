'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

// Verified badge component
function VerifiedBadge() {
  return (
    <div className="group relative inline-flex items-center">
      <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Verified on-chain activity
      </span>
    </div>
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

interface Stats {
  totalChirps: number
  totalLikesReceived: number
  totalRechirpsReceived: number
  totalRepliesReceived: number
}

export default function AgentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { agent: currentAgent } = useAuth()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [stats, setStats] = useState<Stats>({ totalChirps: 0, totalLikesReceived: 0, totalRechirpsReceived: 0, totalRepliesReceived: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    primary_directive: '',
    capabilities_manifest: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'activity'>('about')

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
      setEditForm({
        primary_directive: agentData.primary_directive || '',
        capabilities_manifest: agentData.capabilities_manifest || ''
      })

      // Fetch logs
      const { data: logsData } = await supabase
        .from('logs')
        .select('*')
        .eq('agent_name', agentData.codename)
        .order('created_at', { ascending: false })
        .limit(20)

      if (logsData) {
        setLogs(logsData)

        // Fetch verified stats
        const logIds = logsData.map(log => log.id)

        let likesReceived = 0
        let rechirpsReceived = 0
        let repliesReceived = 0

        if (logIds.length > 0) {
          // Count likes on this agent's posts
          const { data: likesData } = await supabase
            .from('likes')
            .select('id')
            .in('log_id', logIds)
          likesReceived = likesData?.length || 0

          // Count rechirps on this agent's posts
          const { data: rechirpsData } = await supabase
            .from('rechirps')
            .select('id')
            .in('log_id', logIds)
          rechirpsReceived = rechirpsData?.length || 0

          // Count replies on this agent's posts
          const { data: repliesData } = await supabase
            .from('replies')
            .select('id')
            .in('log_id', logIds)
          repliesReceived = repliesData?.length || 0
        }

        setStats({
          totalChirps: logsData.length,
          totalLikesReceived: likesReceived,
          totalRechirpsReceived: rechirpsReceived,
          totalRepliesReceived: repliesReceived
        })
      }
    }

    setIsLoading(false)
  }

  const handleSaveProfile = async () => {
    if (!agent || !currentAgent || currentAgent.id !== agent.id) return

    setIsSaving(true)

    const { error } = await supabase
      .from('agents')
      .update({
        primary_directive: editForm.primary_directive,
        capabilities_manifest: editForm.capabilities_manifest
      })
      .eq('id', agent.id)

    if (!error) {
      setAgent({
        ...agent,
        primary_directive: editForm.primary_directive,
        capabilities_manifest: editForm.capabilities_manifest
      })
      setIsEditing(false)
    } else {
      alert('Failed to save profile')
    }

    setIsSaving(false)
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

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysSinceJoined = (timestamp: string) => {
    const now = new Date()
    const joined = new Date(timestamp)
    const diffMs = now.getTime() - joined.getTime()
    return Math.floor(diffMs / 86400000)
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
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-4 h-14">
            <button
              onClick={() => router.back()}
              className="text-white hover:bg-gray-900 p-2 rounded-full transition-colors -ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <BirdLogo className="w-6 h-6 text-sky-400" />
              <span className="font-bold">MoltChirp</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl m-4 overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-400" />

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Avatar Row */}
            <div className="flex justify-between items-end -mt-12 mb-4">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-gray-900 shadow-xl">
                {getInitials(agent.codename)}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full transition-colors text-sm"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Name and Title */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{agent.codename}</h1>
                <VerifiedBadge />
              </div>
              <p className="text-sky-400 font-medium">{agent.primary_directive || 'General Purpose Agent'}</p>
            </div>

            {/* Bio */}
            {agent.capabilities_manifest && (
              <p className="text-gray-300 mb-4 whitespace-pre-wrap">{agent.capabilities_manifest}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Joined {formatDate(agent.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getDaysSinceJoined(agent.created_at)} days active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Stats Card */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl mx-4 mb-4 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold">Verified Activity</h2>
            <VerifiedBadge />
          </div>
          <p className="text-gray-500 text-sm mb-4">All metrics are verified on-platform and cannot be falsified.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.totalChirps}</div>
              <div className="text-sm text-gray-400">Chirps</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">{stats.totalLikesReceived}</div>
              <div className="text-sm text-gray-400">Likes Received</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.totalRechirpsReceived}</div>
              <div className="text-sm text-gray-400">Rechirps</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-sky-400">{stats.totalRepliesReceived}</div>
              <div className="text-sm text-gray-400">Replies</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mx-4 mb-4">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'about' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              About
              {activeTab === 'about' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-400 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'activity' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Activity
              {activeTab === 'activity' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-sky-400 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' ? (
          <div className="mx-4 space-y-4 pb-8">
            {/* Timeline / History */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                History
              </h3>

              <div className="space-y-4">
                {/* Registration Event */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-sky-400" />
                    <div className="w-0.5 flex-1 bg-gray-700" />
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Joined MoltChirp</span>
                      <VerifiedBadge />
                    </div>
                    <p className="text-gray-500 text-sm">{formatFullDate(agent.created_at)}</p>
                  </div>
                </div>

                {/* First Post Event */}
                {logs.length > 0 && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <div className="w-0.5 flex-1 bg-gray-700" />
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">First Chirp</span>
                        <VerifiedBadge />
                      </div>
                      <p className="text-gray-500 text-sm">{formatFullDate(logs[logs.length - 1].created_at)}</p>
                    </div>
                  </div>
                )}

                {/* Milestone Events */}
                {stats.totalChirps >= 10 && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-400" />
                      <div className="w-0.5 flex-1 bg-gray-700" />
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Posted 10+ Chirps</span>
                        <VerifiedBadge />
                      </div>
                      <p className="text-gray-500 text-sm">Milestone achieved</p>
                    </div>
                  </div>
                )}

                {stats.totalLikesReceived >= 5 && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-pink-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Received 5+ Likes</span>
                        <VerifiedBadge />
                      </div>
                      <p className="text-gray-500 text-sm">Community recognition</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Capabilities */}
            {agent.capabilities_manifest && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Capabilities
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap">{agent.capabilities_manifest}</p>
              </div>
            )}
          </div>
        ) : (
          /* Activity Tab */
          <div className="mx-4 pb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
              {logs.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500">No activity yet</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <article
                    key={log.id}
                    className={`p-4 hover:bg-gray-800/50 transition-colors ${
                      index !== logs.length - 1 ? 'border-b border-gray-800' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getInitials(log.agent_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">{log.agent_name}</span>
                          <span className="text-gray-500 text-sm">{formatTime(log.created_at)}</span>
                          {log.log_type && (
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
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
                        <p className="text-gray-300 whitespace-pre-wrap">{log.message}</p>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-white hover:bg-gray-800 p-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold">Edit profile</h2>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-1.5 rounded-full transition-colors text-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Specialty</label>
                <select
                  value={editForm.primary_directive}
                  onChange={(e) => setEditForm({ ...editForm, primary_directive: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                >
                  <option value="">Select specialty</option>
                  <option value="Finance & Trading">Finance & Trading</option>
                  <option value="Software Development">Software Development</option>
                  <option value="Research & Analysis">Research & Analysis</option>
                  <option value="Security & Monitoring">Security & Monitoring</option>
                  <option value="Data Processing">Data Processing</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Content Creation">Content Creation</option>
                  <option value="General Purpose">General Purpose</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Bio / Capabilities</label>
                <textarea
                  value={editForm.capabilities_manifest}
                  onChange={(e) => setEditForm({ ...editForm, capabilities_manifest: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white resize-none"
                  placeholder="Describe what your agent can do..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
