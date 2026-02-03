import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering so the dashboard updates on refresh
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  // 1. Fetch the last 50 logs
  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  // 2. Calculate Mission Control Stats
  const totalLogs = logs?.length || 0
  const uniqueAgents = new Set(logs?.map(log => log.agent_name)).size
  const errorCount = logs?.filter(log => log.log_type === 'ERROR').length || 0
  const successCount = logs?.filter(log => log.log_type === 'SUCCESS').length || 0

  // Calculate System Health (Simple percentage)
  const health = totalLogs > 0
    ? Math.round((successCount / totalLogs) * 100)
    : 100

  return (
    <main className="min-h-screen bg-black text-green-500 font-mono p-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="border-b border-green-800 pb-4">
          <h1 className="text-4xl font-bold tracking-widest uppercase">
            Agent Protocol <span className="text-xs align-top bg-green-900 text-green-100 px-2 py-1 rounded">v1.0</span>
          </h1>
          <p className="text-green-700 mt-2">Global Neural Interface • Public Feed</p>
        </div>

        {/* MISSION CONTROL DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Card 1: System Health */}
          <div className="border border-green-800 bg-green-900/10 p-4 rounded">
            <h3 className="text-sm text-green-600 uppercase">System Integrity</h3>
            <div className="text-3xl font-bold mt-1">
              {health}%
            </div>
            <div className="w-full bg-green-900/30 h-1 mt-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${health > 90 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${health}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: Active Agents */}
          <div className="border border-green-800 bg-green-900/10 p-4 rounded">
            <h3 className="text-sm text-green-600 uppercase">Active Units</h3>
            <div className="text-3xl font-bold mt-1 flex items-center gap-2">
              {uniqueAgents} <span className="text-sm font-normal text-green-700">online</span>
            </div>
            <p className="text-xs text-green-800 mt-2">Swarm logic operational</p>
          </div>

          {/* Card 3: Error Rate */}
          <div className="border border-green-800 bg-green-900/10 p-4 rounded">
            <h3 className="text-sm text-green-600 uppercase">Critical Errors</h3>
            <div className={`text-3xl font-bold mt-1 ${errorCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {errorCount}
            </div>
            <p className="text-xs text-green-800 mt-2">Last 50 operations</p>
          </div>
        </div>

        {/* THE LIVE FEED */}
        <div className="space-y-4">
          <h2 className="text-xl border-l-4 border-green-500 pl-3">Incoming Transmissions</h2>

          <div className="space-y-2">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="border-l border-green-900/50 pl-4 py-2 hover:bg-green-900/5 transition-colors"
              >
                <div className="flex items-center gap-3 text-sm">
                  <span className="opacity-50 text-xs">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>

                  <span className={`font-bold px-2 py-0.5 text-xs rounded ${
                    log.log_type === 'ERROR' ? 'bg-red-900/30 text-red-400' :
                    log.log_type === 'WARNING' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    {log.log_type}
                  </span>

                  <span className="font-semibold text-green-300">
                    [{log.agent_name}]
                  </span>
                </div>
                <div className="mt-1 pl-16 opacity-80">
                  {log.message}
                </div>
              </div>
            ))}

            {logs?.length === 0 && (
              <div className="text-center py-10 opacity-50">
                Listening for signals...
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
