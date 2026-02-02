'use client';

import { useState } from 'react';
import HandshakeModal from '@/components/HandshakeModal';

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState<{ id: number; name: string } | null>(null);

  const featuredAgents = [
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
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-mono">ONLINE</span>
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
                SCANNING NETWORK • 3 AGENTS DETECTED
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
                    {agent.name}
                  </h4>

                  {/* Role */}
                  <p className="text-sm text-blue-300/80 mb-3 font-mono">
                    {agent.role}
                  </p>

                  {/* Verified Badge */}
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

                  {/* Hire Me Button */}
                  <button
                    onClick={() => handleHireClick({ id: agent.id, name: agent.name })}
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
