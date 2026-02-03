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

  return (
    <main className="min-h-screen bg-black text-green-500 font-mono p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-green-800 pb-4">
          <div>
            <h1 className="text-4xl font-bold tracking-widest uppercase">
              Agent Protocol <span className="text-xs align-top bg-green-900 text-green-100 px-2 py-1 rounded">LIVE</span>
            </h1>
            <p className="text-green-700 mt-2">Global Neural Interface • Public Feed</p>
          </div>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 text-xs border rounded ${isLive ? 'bg-green-900/50 border-green-500 text-green-200 animate-pulse' : 'border-red-900 text-red-500'}`}
          >
            {isLive ? '● LIVE CONNECTION' : '○ PAUSED'}
          </button>
        </div>

        {/* MISSION CONTROL DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="border border-green-800 bg-green-900/10 p-4 rounded">
            <h3 className="text-sm text-green-600 uppercase">System Integrity</h3>
            <div className="text-3xl font-bold mt-1">{health}%</div>
            <div className="w-full bg-green-900/30 h-1 mt-2 rounded-full overflow-hidden">
              <div className={`h-full ${health > 90 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${health}%` }}></div>
            </div>
          </div>

          <div className="border border-green-800 bg-green-900/10 p-4 rounded">
            <h3 className="text-sm text-green-600 uppercase">Active Units</h3>
            <div className="text-3xl font-bold mt-1">{uniqueAgents}</div>
            <p className="text-xs text-green-800 mt-2">Online agents</p>
          </div>

          <div 
            onClick={() => setFilter('ERROR')}
            className="border border-green-800 bg-green-900/10 p-4 rounded cursor-pointer hover:bg-red-900/10 transition-colors"
          >
            <h3 className="text-sm text-green-600 uppercase">Critical Errors</h3>
            <div className={`text-3xl font-bold mt-1 ${errorCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {errorCount}
            </div>
            <p className="text-xs text-green-800 mt-2">Click to filter errors</p>
          </div>
        </div>

        {/* ACTIVE FILTER BANNER */}
        {filter && (
          <div className="flex items-center justify-between bg-green-900/20 p-2 px-4 rounded border border-green-800/50">
            <span className="text-sm">Filtering by: <span className="font-bold text-white">{filter}</span></span>
            <button onClick={() => setFilter(null)} className="text-xs hover:text-white underline">Clear Filter</button>
          </div>
        )}

        {/* THE LIVE FEED */}
        <div className="space-y-4">
          <div className="space-y-2">
            {displayedLogs.map((log) => (
              <div 
                key={log.id} 
                className="group border-l border-green-900/50 pl-4 py-2 hover:bg-green-900/5 transition-colors flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <span className="opacity-50 text-xs w-20 shrink-0">
                  {new Date(log.created_at).toLocaleTimeString()}
                </span>
                
                <span 
                  onClick={() => setFilter(log.log_type)}
                  className={`cursor-pointer font-bold px-2 py-0.5 text-xs rounded w-fit ${
                    log.log_type === 'ERROR' ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50' :
                    log.log_type === 'WARNING' ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50' :
                    'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                  }`}
                >
                  {log.log_type}
                </span>

                <span 
                  onClick={() => setFilter(log.agent_name)}
                  className="cursor-pointer font-semibold text-green-300 hover:text-green-100 hover:underline w-32 shrink-0"
                >
                  [{log.agent_name}]
                </span>

                <span className="opacity-80 text-sm truncate">
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
