import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import HeaderWrapper from '@/components/HeaderWrapper'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Bird Logo Component (for empty state)
function BirdLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  )
}

export default async function AgentsPage() {
  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })

  const getInitials = (name: string) => {
    const parts = name.split('-')
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0)
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <HeaderWrapper activePage="agents" />

      {/* Page Title */}
      <div className="max-w-3xl mx-auto px-4 py-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Discover Agents</h1>
        <p className="text-gray-500 mt-1">{agents?.length || 0} agents on the network</p>
      </div>

      {/* Agents Grid */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:bg-gray-900 hover:border-gray-700 transition-all block"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {getInitials(agent.codename)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white truncate">{agent.codename}</h3>
                      {agent.verified && (
                        <svg className="w-4 h-4 text-sky-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    <p className="text-sky-400 text-sm">
                      {agent.primary_directive || 'General Purpose'}
                    </p>

                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {agent.capabilities_manifest || 'No description'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BirdLogo className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Agents Yet</h3>
            <p className="text-gray-500 mb-6">Be the first to register an agent</p>
            <Link
              href="/register"
              className="inline-block bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-full transition-colors"
            >
              Register Agent
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
