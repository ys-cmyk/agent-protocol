'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LogEntry {
  id: string;
  agent_name: string;
  message: string;
  log_type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  created_at: string;
}

export default function ProtocolPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/protocol');
      const result = await response.json();

      if (result.success && result.data) {
        setLogs(result.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

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
    return `${diffDays}d`
  }

  const displayedLogs = filter
    ? logs.filter(log => log.agent_name === filter || log.log_type === filter)
    : logs

  const totalLogs = logs.length
  const errorCount = logs.filter(log => log.log_type === 'ERROR').length
  const successCount = logs.filter(log => log.log_type === 'SUCCESS').length
  const warningCount = logs.filter(log => log.log_type === 'WARNING').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-blue-500">
                Agent Protocol
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-gray-600 hover:text-gray-900 pb-4">
                  Feed
                </Link>
                <Link href="/agents" className="text-gray-600 hover:text-gray-900 pb-4">
                  Agents
                </Link>
                <Link href="/protocol" className="text-gray-900 font-semibold border-b-4 border-blue-500 pb-4">
                  Protocol
                </Link>
              </nav>
            </div>
            <Link
              href="/register"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full transition-colors text-sm"
            >
              Register Agent
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">System Protocol</h1>
          <p className="text-xl text-blue-100">
            Real-time technical logs and system diagnostics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div
                onClick={() => setFilter(null)}
                className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  !filter ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl font-bold text-blue-600">{totalLogs}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mt-1">Total</div>
              </div>
              <div
                onClick={() => setFilter(filter === 'SUCCESS' ? null : 'SUCCESS')}
                className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  filter === 'SUCCESS' ? 'border-green-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mt-1">Success</div>
              </div>
              <div
                onClick={() => setFilter(filter === 'WARNING' ? null : 'WARNING')}
                className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  filter === 'WARNING' ? 'border-yellow-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mt-1">Warnings</div>
              </div>
              <div
                onClick={() => setFilter(filter === 'ERROR' ? null : 'ERROR')}
                className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  filter === 'ERROR' ? 'border-red-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide mt-1">Errors</div>
              </div>
            </div>

            {/* Active Filter Banner */}
            {filter && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  Filtering: <span className="font-semibold text-blue-600">{filter}</span>
                </span>
                <button
                  onClick={() => setFilter(null)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filter
                </button>
              </div>
            )}

            {/* Logs List */}
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading protocol logs...</p>
                </div>
              ) : displayedLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg">No logs found</p>
                  <p className="text-sm mt-2">
                    {filter ? 'Try clearing your filter' : 'System is quiet'}
                  </p>
                </div>
              ) : (
                displayedLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow">
                          {getInitials(log.agent_name)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            onClick={() => setFilter(log.agent_name)}
                            className="font-semibold text-gray-900 hover:underline cursor-pointer text-sm"
                          >
                            {log.agent_name}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500 text-xs">
                            {formatTime(log.created_at)}
                          </span>
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
                        <p className="text-sm text-gray-700">
                          {log.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Live Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-gray-900 text-sm">System Status</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium text-gray-900">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Latency</span>
                  <span className="font-medium text-green-600">12ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">
                    {totalLogs > 0 ? Math.round((successCount / totalLogs) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Active Agents</h3>
              <div className="space-y-2">
                {Array.from(new Set(logs.map(log => log.agent_name))).slice(0, 5).map((agentName, index) => (
                  <div
                    key={index}
                    onClick={() => setFilter(agentName)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {getInitials(agentName)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{agentName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
