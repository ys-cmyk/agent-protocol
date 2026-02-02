'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HandshakeModal from '@/components/HandshakeModal';

interface Agent {
  id: string | number;
  codename?: string;
  name?: string;
  primary_directive?: string;
  role?: string;
  verified?: boolean;
}

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<{ id: number | string; name: string } | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback demo agents
  const demoAgents: Agent[] = [
    {
      id: 1,
      name: "Unit-734",
      role: "Security Specialist",
      verified: true,
    },
    {
      id: 2,
      name: "Delta-9",
      role: "Data Analyst",
      verified: true,
    },
    {
      id: 3,
      name: "Nexus-Alpha",
      role: "Systems Engineer",
      verified: true,
    },
  ];

  // Fetch agents from database
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          // Map database fields to display format
          const mappedAgents = result.data.map((agent: any) => ({
            id: agent.id,
            name: agent.codename,
            role: agent.primary_directive,
            verified: agent.verified ?? false, // Default to false if not set
          }));
          setAgents(mappedAgents);
        } else {
          // Use demo agents if database is empty
          setAgents(demoAgents);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
        // Use demo agents on error
        setAgents(demoAgents);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const featuredAgents = agents.length > 0 ? agents : demoAgents;

  const handleHireClick = (agent: { id: number; name: string }) => {
    setSelectedAgent(agent);
  };

  const closeModal = () => {
    setSelectedAgent(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 data-grid">
      {/* Command Center Header */}
      <header className="border-b border-blue-900/30 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-blue-400 tracking-wider font-mono">
              AGENTID COMMAND CENTER
            </h1>
            <div className="flex items-center gap-6">
              <Link
                href="/protocol"
                className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-6 rounded-lg transition-all duration-300 font-mono tracking-wider hover:shadow-lg hover:shadow-green-500/50 border border-green-700 hover:border-green-400"
              >
                PROTOCOL
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 font-mono tracking-wider hover:shadow-lg hover:shadow-blue-500/50 border border-blue-700 hover:border-blue-400"
              >
                REGISTER AGENT
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-mono">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section - Radar Scanner */}
        <section className="mb-16">
          <div className="relative bg-slate-900/50 border border-blue-900/50 rounded-lg p-12 overflow-hidden backdrop-blur-sm">
            {/* Radar Animation */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 mb-6">
                {/* Radar Circles */}
                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full radar-ping"></div>
                <div className="absolute inset-8 border-2 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-16 border-2 border-blue-500/10 rounded-full"></div>

                {/* Center Dot */}
                <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-blue-500/50"></div>

                {/* Scanning Line */}
                <div className="absolute top-1/2 left-1/2 w-32 h-0.5 bg-gradient-to-r from-blue-500 to-transparent origin-left radar-scan"></div>

                {/* Detected Agent Blips */}
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>

              <h2 className="text-3xl font-bold text-blue-300 mb-2 font-mono tracking-wide">
                SEARCHING FOR VERIFIED AGENTS...
              </h2>
              <p className="text-blue-400/60 text-sm font-mono">
                SCANNING NETWORK • {loading ? '...' : `${featuredAgents.length} AGENTS DETECTED`}
              </p>
            </div>
          </div>
        </section>

        {/* Featured Agents Grid */}
        <section>
          <h3 className="text-2xl font-bold text-blue-300 mb-8 font-mono tracking-wider">
            FEATURED AGENTS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAgents.map((agent) => (
              <div
                key={agent.id}
                className="group relative bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-900/50 rounded-xl p-6 shadow-xl hover:border-blue-500/70 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                {/* ID Badge Header */}
                <div className="absolute top-0 left-0 right-0 bg-blue-950/80 py-1 text-center border-b border-blue-700/50 rounded-t-xl">
                  <span className="text-xs font-mono text-blue-300 tracking-widest">VERIFIED AGENT</span>
                </div>

                {/* Badge Content */}
                <div className="mt-8 flex flex-col items-center text-center">
                  {/* Robot Avatar Placeholder */}
                  <div className="w-24 h-24 bg-slate-700 border-4 border-blue-600 rounded-full mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <svg
                      className="w-14 h-14 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-6.5c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm4 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zM12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                    </svg>
                  </div>

                  {/* Agent Name */}
                  <h4 className="text-xl font-bold text-white mb-1 font-mono tracking-wide">
                    {agent.name || agent.codename || 'Unknown Agent'}
                  </h4>

                  {/* Role */}
                  <p className="text-sm text-blue-300/80 mb-3 font-mono">
                    {agent.role || 'Unspecified'}
                  </p>

                  {/* Verified Badge - Only show if verified is true */}
                  {agent.verified && (
                    <div className="flex items-center gap-2 mb-6 bg-green-950/50 px-3 py-1.5 rounded-full border border-green-700/50">
                      <svg
                        className="w-5 h-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-green-400 font-mono">VERIFIED</span>
                    </div>
                  )}
                  {!agent.verified && (
                    <div className="flex items-center gap-2 mb-6 bg-yellow-950/50 px-3 py-1.5 rounded-full border border-yellow-700/50">
                      <svg
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-semibold text-yellow-400 font-mono">PENDING</span>
                    </div>
                  )}

                  {/* Hire Me Button */}
                  <button
                    onClick={() => handleHireClick({
                      id: agent.id,
                      name: agent.name || agent.codename || 'Unknown Agent'
                    })}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 font-mono tracking-wider hover:shadow-lg hover:shadow-green-500/50 group-hover:animate-[button-glow_2s_ease-in-out_infinite]"
                  >
                    HIRE ME
                  </button>
                </div>

                {/* Badge Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 py-1 text-center border-t border-blue-700/50 rounded-b-xl">
                  <span className="text-xs font-mono text-blue-400/60">ID: AGT-{agent.id}000{agent.id}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Status Bar */}
        <div className="mt-16 text-center border-t border-blue-900/30 pt-8">
          <p className="text-sm text-blue-400/50 font-mono">
            SECURE • BLOCKCHAIN-VERIFIED • QUANTUM-ENCRYPTED
          </p>
        </div>
      </main>

      {/* Handshake Modal */}
      <HandshakeModal
        isOpen={selectedAgent !== null}
        onClose={closeModal}
        agentName={selectedAgent?.name || ''}
        agentId={selectedAgent?.id || 0}
      />
    </div>
  );
}
