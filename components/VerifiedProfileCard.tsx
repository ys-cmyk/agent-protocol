import React from 'react';

interface AgentProfile {
  name: string;
  agentId: string;
  role: string;
  organization: string;
  issueDate: string;
  expiryDate: string;
  clearanceLevel: string;
  avatarUrl?: string;
}

export default function VerifiedProfileCard({ profile }: { profile: AgentProfile }) {
  return (
    <div className="relative w-full max-w-2xl mx-auto perspective-1000">
      {/* ID Card Container */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl overflow-hidden glow-border">
        {/* Holographic overlay effect */}
        <div className="absolute inset-0 shimmer pointer-events-none" />

        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(59, 130, 246, .3) 25%, rgba(59, 130, 246, .3) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, .3) 75%, rgba(59, 130, 246, .3) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(59, 130, 246, .3) 25%, rgba(59, 130, 246, .3) 26%, transparent 27%, transparent 74%, rgba(59, 130, 246, .3) 75%, rgba(59, 130, 246, .3) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '30px 30px'
          }} />
        </div>

        {/* Header */}
        <div className="relative border-b border-blue-800/50 bg-gradient-to-r from-blue-950/50 to-slate-900/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono text-blue-300 tracking-widest">UNIFIED AGENT NETWORK</h2>
              <h1 className="text-2xl font-bold text-white tracking-tight">VERIFIED AGENT ID</h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-lg">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-emerald-400 tracking-wider">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Profile Photo */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-75" />
                <div className="relative w-40 h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border-2 border-blue-500/50 flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-6xl text-blue-400">
                      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="w-24 h-24 bg-white rounded-lg p-2 border-2 border-slate-700">
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Crect x='0' y='0' width='4' height='4'/%3E%3Crect x='8' y='0' width='4' height='4'/%3E%3Crect x='16' y='0' width='4' height='4'/%3E%3Crect x='0' y='8' width='4' height='4'/%3E%3Crect x='16' y='8' width='4' height='4'/%3E%3Crect x='0' y='16' width='4' height='4'/%3E%3Crect x='8' y='16' width='4' height='4'/%3E%3Crect x='16' y='16' width='4' height='4'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '100% 100%'
                }} />
              </div>
              <p className="text-xs text-blue-300 font-mono">SCAN TO VERIFY</p>
            </div>

            {/* Right: Agent Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Name and ID */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-blue-300 tracking-wider mb-1">AGENT NAME</label>
                  <p className="text-2xl font-bold text-white tracking-wide">{profile.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-mono text-blue-300 tracking-wider mb-1">AGENT ID</label>
                  <p className="text-lg font-mono text-cyan-400 tracking-widest">{profile.agentId}</p>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-blue-900/50 rounded-lg p-4">
                  <label className="block text-xs font-mono text-blue-300 tracking-wider mb-1">ROLE</label>
                  <p className="text-sm font-semibold text-white">{profile.role}</p>
                </div>
                <div className="bg-slate-900/50 border border-blue-900/50 rounded-lg p-4">
                  <label className="block text-xs font-mono text-blue-300 tracking-wider mb-1">ORGANIZATION</label>
                  <p className="text-sm font-semibold text-white">{profile.organization}</p>
                </div>
                <div className="bg-slate-900/50 border border-blue-900/50 rounded-lg p-4">
                  <label className="block text-xs font-mono text-blue-300 tracking-wider mb-1">CLEARANCE</label>
                  <p className="text-sm font-semibold text-emerald-400">{profile.clearanceLevel}</p>
                </div>
                <div className="bg-slate-900/50 border border-blue-900/50 rounded-lg p-4">
                  <label className="block text-xs font-mono text-blue-300 tracking-wider mb-1">STATUS</label>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-sm font-semibold text-emerald-400">ACTIVE</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="flex justify-between items-center pt-4 border-t border-blue-900/50">
                <div>
                  <label className="block text-xs font-mono text-blue-300 tracking-wider mb-1">ISSUED</label>
                  <p className="text-sm font-mono text-white">{profile.issueDate}</p>
                </div>
                <div>
                  <label className="block text-xs font-mono text-blue-300 tracking-wider mb-1">EXPIRES</label>
                  <p className="text-sm font-mono text-white">{profile.expiryDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative border-t border-blue-800/50 bg-gradient-to-r from-slate-900/50 to-blue-950/50 px-8 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-blue-400/70">
              UAN-2026 | BLOCKCHAIN VERIFIED | ISO-27001 COMPLIANT
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <p className="text-xs font-mono text-blue-400">SECURE</p>
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-blue-500/50" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-500/50" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-blue-500/50" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-blue-500/50" />
      </div>
    </div>
  );
}
