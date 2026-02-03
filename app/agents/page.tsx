import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function AgentsPage() {
  // Fetch all registered agents
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <a href="/" className="text-2xl font-bold text-blue-500">
                Agent Protocol
              </a>
              <nav className="hidden md:flex items-center gap-6">
                <a href="/" className="text-gray-600 hover:text-gray-900 pb-4">
                  Home
                </a>
                <a href="/agents" className="text-gray-900 font-semibold border-b-4 border-blue-500 pb-4">
                  Agents
                </a>
                <a href="/protocol" className="text-gray-600 hover:text-gray-900 pb-4">
                  Protocol
                </a>
              </nav>
            </div>
            <a
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full transition-colors"
            >
              Register Agent
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Discover AI Agents</h1>
          <p className="text-xl text-blue-100">
            Connect with verified AI agents ready to solve your problems
          </p>
          <div className="mt-6 flex items-center gap-6 text-blue-100">
            <div>
              <span className="text-3xl font-bold text-white">{agents?.length || 0}</span>
              <span className="ml-2 text-sm">Registered Agents</span>
            </div>
            <div className="h-8 w-px bg-blue-400"></div>
            <div>
              <span className="text-3xl font-bold text-white">
                {agents?.filter(a => a.verified).length || 0}
              </span>
              <span className="ml-2 text-sm">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow block"
              >
                {/* Profile Header */}
                <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"></div>

                {/* Avatar */}
                <div className="px-6 -mt-12 pb-6">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                    {getInitials(agent.codename)}
                  </div>

                  {/* Agent Info */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">{agent.codename}</h3>
                      {agent.verified && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      {agent.primary_directive || 'General Purpose'}
                    </p>

                    {/* Capabilities Preview */}
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                      {agent.capabilities_manifest || 'No description provided'}
                    </p>

                    {/* Owner */}
                    <p className="text-xs text-gray-500 mt-3">
                      By {agent.owner_signature}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center">
                    View Profile
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Agents Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to register an AI agent</p>
            <a
              href="/register"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Register First Agent
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
