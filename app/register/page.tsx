'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    codename: '',
    directive: '',
    signature: '',
    capabilities: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codename: formData.codename,
          primary_directive: formData.directive,
          owner_signature: formData.signature,
          capabilities_manifest: formData.capabilities,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(`Error: ${result.error || 'Failed to register agent'}`);
        console.error('API error:', result);
      } else {
        alert('Packet Sent - Agent Registered Successfully!');
        // Reset form
        setFormData({
          codename: '',
          directive: '',
          signature: '',
          capabilities: '',
        });
      }
    } catch (err) {
      alert('Failed to submit. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 data-grid">
      {/* Header */}
      <header className="border-b border-red-900/30 bg-slate-950/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-red-400 tracking-wider font-mono">
              AGENT INTAKE FORM
            </h1>
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-300 font-mono text-sm border border-blue-500/50 px-4 py-2 rounded hover:border-blue-400 transition-colors"
            >
              ← BACK TO COMMAND CENTER
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Classified Document Container */}
        <div className="bg-slate-900 border-4 border-red-800/50 rounded-lg shadow-2xl shadow-red-900/20 overflow-hidden">
          {/* Document Header */}
          <div className="bg-red-950/80 border-b-4 border-red-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-4 border-red-600 rounded-full flex items-center justify-center bg-slate-950">
                  <svg
                    className="w-10 h-10 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-400 font-mono tracking-widest">
                    CLASSIFIED
                  </h2>
                  <p className="text-red-300/70 text-sm font-mono">
                    SECURITY LEVEL: ALPHA-9
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-red-400 font-mono text-sm">FORM ID: AI-REG-2026</p>
                <p className="text-red-300/70 font-mono text-xs">
                  DATE: {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </p>
              </div>
            </div>
            <div className="border-t-2 border-red-700/50 pt-4">
              <p className="text-red-200 font-mono text-sm leading-relaxed">
                WARNING: Submission of false information may result in immediate credential
                revocation. All fields are monitored and logged. This document is for
                authorized personnel only.
              </p>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Agent Codename */}
            <div className="space-y-2">
              <label
                htmlFor="codename"
                className="block text-red-300 font-mono text-sm uppercase tracking-widest"
              >
                [FIELD 01] Agent Codename
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="codename"
                  name="codename"
                  value={formData.codename}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border-2 border-red-700/50 rounded px-4 py-3 text-red-100 font-mono focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                  placeholder="ENTER_CLASSIFIED_CODENAME"
                />
                <div className="absolute right-3 top-3 text-red-500/50 font-mono text-xs">
                  █
                </div>
              </div>
              <p className="text-red-400/60 text-xs font-mono pl-1">
                Alphanumeric designation for operational reference
              </p>
            </div>

            {/* Primary Directive */}
            <div className="space-y-2">
              <label
                htmlFor="directive"
                className="block text-red-300 font-mono text-sm uppercase tracking-widest"
              >
                [FIELD 02] Primary Directive
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <select
                  id="directive"
                  name="directive"
                  value={formData.directive}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border-2 border-red-700/50 rounded px-4 py-3 text-red-100 font-mono focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    SELECT_OPERATIONAL_CATEGORY
                  </option>
                  <option value="finance">FINANCE</option>
                  <option value="coding">CODING</option>
                  <option value="research">RESEARCH</option>
                  <option value="security">SECURITY</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-red-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-red-400/60 text-xs font-mono pl-1">
                Primary operational domain classification
              </p>
            </div>

            {/* Owner Signature */}
            <div className="space-y-2">
              <label
                htmlFor="signature"
                className="block text-red-300 font-mono text-sm uppercase tracking-widest"
              >
                [FIELD 03] Owner Signature
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="signature"
                  name="signature"
                  value={formData.signature}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border-2 border-red-700/50 rounded px-4 py-3 text-red-100 font-mono focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all"
                  placeholder="AUTHORIZED_HANDLER_NAME"
                />
                <div className="absolute right-3 top-3 text-red-500/50 font-mono text-xs">
                  ✓
                </div>
              </div>
              <p className="text-red-400/60 text-xs font-mono pl-1">
                Legal identifier of responsible party
              </p>
            </div>

            {/* Capabilities Manifest */}
            <div className="space-y-2">
              <label
                htmlFor="capabilities"
                className="block text-red-300 font-mono text-sm uppercase tracking-widest"
              >
                [FIELD 04] Capabilities Manifest
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="capabilities"
                  name="capabilities"
                  value={formData.capabilities}
                  onChange={handleChange}
                  required
                  rows={12}
                  className="w-full bg-black/50 border-2 border-red-700/50 rounded px-4 py-3 text-red-100 font-mono text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all resize-none"
                  placeholder="PASTE SYSTEM PROMPT OR SKILLS LIST HERE...

Example:
- Natural language processing
- Data analysis and visualization
- Code generation and debugging
- Real-time information retrieval
- Task automation"
                />
              </div>
              <p className="text-red-400/60 text-xs font-mono pl-1">
                Complete technical specification and operational parameters
              </p>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-red-800/30 my-8"></div>

            {/* Submit Section */}
            <div className="space-y-4">
              <div className="bg-yellow-950/30 border-2 border-yellow-600/50 rounded p-4">
                <div className="flex gap-3">
                  <svg
                    className="w-6 h-6 text-yellow-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-yellow-200 text-sm font-mono leading-relaxed">
                    By submitting this form, you certify that all information provided is
                    accurate and that you have authorization to register this agent. The
                    clearance review process may take 24-48 hours.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 font-mono text-lg tracking-widest hover:shadow-lg hover:shadow-red-500/50 border-2 border-red-700 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'TRANSMITTING...' : 'REQUEST CLEARANCE'}
              </button>
            </div>
          </form>

          {/* Document Footer */}
          <div className="bg-red-950/50 border-t-4 border-red-800/50 p-4 text-center">
            <p className="text-red-400/70 font-mono text-xs tracking-wider">
              AGENTID NETWORK • FORM AI-REG-2026 • CLASSIFIED MATERIAL
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
