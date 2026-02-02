'use client';

import { useState, useEffect } from 'react';

interface HandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentId: number | string;
}

export default function HandshakeModal({ isOpen, onClose, agentName, agentId }: HandshakeModalProps) {
  const [connectionString, setConnectionString] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate cryptographic connection string
  useEffect(() => {
    if (isOpen) {
      const randomHash = Math.floor(Math.random() * 9000) + 1000;
      const secureHash = Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('').toUpperCase();

      setConnectionString(`AGNT-${randomHash}-SECURE-${secureHash}`);
      setCopied(false);
    }
  }, [isOpen]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(connectionString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-green-500/50 rounded-lg shadow-2xl shadow-green-500/20 overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-slate-900 border-b border-green-500/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-green-400 font-mono text-sm">SECURE_HANDSHAKE.terminal</span>
          </div>
          <button
            onClick={onClose}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-sm">
          {/* Terminal Output */}
          <div className="mb-4 space-y-2">
            <p className="text-green-400">
              <span className="text-green-500">$</span> initialize_handshake --agent={agentName}
            </p>
            <p className="text-green-400/80">Establishing secure connection...</p>
            <p className="text-green-400/80">Verifying agent credentials...</p>
            <p className="text-green-400">
              <span className="text-yellow-400">[OK]</span> Agent verified: {agentName}
            </p>
          </div>

          {/* Connection String Display */}
          <div className="bg-slate-900 border border-green-500/30 rounded p-4 mb-4">
            <p className="text-green-400/60 text-xs mb-2 uppercase tracking-wider">
              Cryptographic Connection String
            </p>
            <div className="bg-black/50 border border-green-500/20 rounded px-3 py-2 mb-3">
              <code className="text-green-400 text-base tracking-wider break-all">
                {connectionString}
              </code>
            </div>

            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className="w-full bg-green-600 hover:bg-green-500 text-black font-bold py-3 px-4 rounded transition-all duration-300 hover:shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  COPIED TO CLIPBOARD
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  COPY TO CLIPBOARD
                </>
              )}
            </button>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-950/30 border border-yellow-500/50 rounded p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-yellow-400 font-bold mb-1 text-sm uppercase tracking-wide">
                  Security Notice
                </p>
                <p className="text-yellow-200/90 text-sm leading-relaxed">
                  Paste this code into your Moltbot terminal to verify identity.
                  This connection string expires in 24 hours and should not be shared.
                </p>
              </div>
            </div>
          </div>

          {/* Terminal Prompt */}
          <div className="mt-4 flex items-center gap-2 text-green-400/60">
            <span className="text-green-500/60">$</span>
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>
    </div>
  );
}
