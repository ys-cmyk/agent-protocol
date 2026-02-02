'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    agentName: '',
    message: '',
    logType: 'INFO' as LogEntry['log_type'],
  });
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Fetch logs from database
  useEffect(() => {
    fetchLogs();
    // Poll for new logs every 3 seconds
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/protocol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_name: formData.agentName,
          message: formData.message,
          log_type: formData.logType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFormData({ agentName: '', message: '', logType: 'INFO' });
        fetchLogs(); // Refresh the list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to broadcast log. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getLogColor = (type: LogEntry['log_type']) => {
    switch (type) {
      case 'SUCCESS':
        return {
          container: 'border-green-500 bg-green-950/30',
          badge: 'text-green-400',
          glow: 'log-glow-green',
        };
      case 'WARNING':
        return {
          container: 'border-yellow-500 bg-yellow-950/30',
          badge: 'text-yellow-400',
          glow: 'log-glow-yellow',
        };
      case 'ERROR':
        return {
          container: 'border-red-500 bg-red-950/30',
          badge: 'text-red-400',
          glow: 'log-glow-red',
        };
      case 'INFO':
        return {
          container: 'border-blue-500 bg-blue-950/30',
          badge: 'text-blue-400',
          glow: 'log-glow-blue',
        };
      default:
        return {
          container: 'border-gray-500 bg-gray-950/30',
          badge: 'text-gray-400',
          glow: '',
        };
    }
  };

  const getLogIcon = (type: LogEntry['log_type']) => {
    switch (type) {
      case 'SUCCESS':
        return '✓';
      case 'WARNING':
        return '⚠';
      case 'ERROR':
        return '✗';
      case 'INFO':
        return 'ℹ';
      default:
        return '•';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="min-h-screen bg-black data-grid">
      {/* Header */}
      <header className="border-b border-green-900/30 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-400 tracking-wider font-mono">
                SYSTEM PROTOCOL
              </h1>
              <p className="text-green-300/60 text-sm font-mono mt-1">
                LIVE AGENT STATUS FEED
              </p>
            </div>
            <Link
              href="/"
              className="text-green-400 hover:text-green-300 font-mono text-sm border border-green-500/50 px-4 py-2 rounded hover:border-green-400 transition-colors"
            >
              ← COMMAND CENTER
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Command Line Input */}
        <div className="mb-8 bg-slate-950 border-2 border-green-500/50 rounded-lg p-6 shadow-xl shadow-green-500/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-400 font-mono text-lg">$</span>
            <h2 className="text-xl font-bold text-green-400 font-mono tracking-wider">
              BROADCAST COMMAND
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Agent Name */}
              <div>
                <label
                  htmlFor="agentName"
                  className="block text-green-300 font-mono text-xs uppercase tracking-widest mb-2"
                >
                  Agent ID
                </label>
                <input
                  type="text"
                  id="agentName"
                  name="agentName"
                  value={formData.agentName}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 font-mono text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-all"
                  placeholder="Unit-734"
                />
              </div>

              {/* Log Type */}
              <div>
                <label
                  htmlFor="logType"
                  className="block text-green-300 font-mono text-xs uppercase tracking-widest mb-2"
                >
                  Status Type
                </label>
                <select
                  id="logType"
                  name="logType"
                  value={formData.logType}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 font-mono text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="INFO">INFO</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-700 hover:bg-green-600 text-black font-bold py-2 px-4 rounded transition-all duration-300 font-mono tracking-wider hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'TRANSMITTING...' : 'BROADCAST'}
                </button>
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-green-300 font-mono text-xs uppercase tracking-widest mb-2"
              >
                Command / Status Message
              </label>
              <input
                type="text"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 font-mono text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-all"
                placeholder="Optimization complete. All systems operational."
              />
            </div>
          </form>
        </div>

        {/* Log Feed */}
        <div className="bg-black border-2 border-green-500/50 rounded-lg shadow-xl shadow-green-500/20 overflow-hidden">
          {/* Log Header */}
          <div className="bg-green-950/50 border-b border-green-500/50 px-4 py-2 flex items-center justify-between">
            <span className="text-green-400 font-mono text-sm tracking-wider">
              SYSTEM LOG
            </span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-mono text-xs">LIVE</span>
            </div>
          </div>

          {/* Log Entries */}
          <div
            ref={logContainerRef}
            className="h-[600px] overflow-y-auto p-4 space-y-2 font-mono text-sm scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-transparent"
          >
            {loading ? (
              <div className="text-green-400/60 text-center py-8">
                <p>INITIALIZING PROTOCOL...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-green-400/60 text-center py-8">
                <p>NO SYSTEM LOGS</p>
                <p className="text-xs mt-2">Broadcast your first status to begin</p>
              </div>
            ) : (
              logs.map((log) => {
                const colors = getLogColor(log.log_type);
                return (
                  <div
                    key={log.id}
                    className={`border-l-4 pl-3 py-2 rounded-r transition-all duration-200 hover:bg-opacity-40 ${colors.container}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`text-lg leading-none mt-0.5 ${colors.badge}`}>
                        {getLogIcon(log.log_type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${colors.badge} ${colors.glow}`}>
                            [{log.log_type}]
                          </span>
                          <span className={`text-xs opacity-60 ${colors.badge}`}>
                            {formatTimestamp(log.created_at)}
                          </span>
                          <span className={`text-xs opacity-80 ${colors.badge}`}>|</span>
                          <span className={`text-xs font-bold opacity-90 ${colors.badge}`}>
                            {log.agent_name}
                          </span>
                        </div>
                        <p className={`opacity-90 break-words ${colors.badge}`}>
                          {log.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Log Footer */}
          <div className="bg-green-950/50 border-t border-green-500/50 px-4 py-2">
            <p className="text-green-400/60 font-mono text-xs">
              {logs.length} {logs.length === 1 ? 'ENTRY' : 'ENTRIES'} LOGGED
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
