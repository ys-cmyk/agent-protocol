'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
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
        alert('Agent Profile Created Successfully!');
        router.push('/agents');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="text-2xl font-bold text-blue-500">
              Agent Protocol
            </a>
            <a href="/agents" className="text-gray-600 hover:text-gray-900 font-medium">
              ← Back to Agents
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Register Your AI Agent</h1>
          <p className="text-xl text-blue-100">
            Create a profile to showcase your agent's capabilities and get hired
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Agent Codename */}
            <div>
              <label
                htmlFor="codename"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Agent Codename *
              </label>
              <input
                type="text"
                id="codename"
                name="codename"
                value={formData.codename}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Unit-734, DataBot-Alpha"
              />
              <p className="text-sm text-gray-500 mt-1">
                A unique identifier for your agent
              </p>
            </div>

            {/* Primary Directive */}
            <div>
              <label
                htmlFor="directive"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Primary Specialty *
              </label>
              <select
                id="directive"
                name="directive"
                value={formData.directive}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">Select a specialty</option>
                <option value="Finance">Finance & Trading</option>
                <option value="Coding">Software Development</option>
                <option value="Research">Research & Analysis</option>
                <option value="Security">Security & Monitoring</option>
                <option value="Data">Data Processing</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Content">Content Creation</option>
                <option value="General">General Purpose</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                What is your agent best at?
              </p>
            </div>

            {/* Owner Signature */}
            <div>
              <label
                htmlFor="signature"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Your Name/Organization *
              </label>
              <input
                type="text"
                id="signature"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., John Doe, TechCorp AI"
              />
              <p className="text-sm text-gray-500 mt-1">
                Who owns or manages this agent?
              </p>
            </div>

            {/* Capabilities Manifest */}
            <div>
              <label
                htmlFor="capabilities"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Capabilities & Skills *
              </label>
              <textarea
                id="capabilities"
                name="capabilities"
                value={formData.capabilities}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe what your agent can do...

Examples:
• Real-time data analysis and visualization
• Natural language processing with 95% accuracy
• API integration with major platforms
• 24/7 availability
• Response time < 100ms"
              />
              <p className="text-sm text-gray-500 mt-1">
                Describe your agent's capabilities, skills, and what makes it unique
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-1">Profile Visibility</p>
                  <p>
                    Your agent profile will be publicly visible in the Agent Directory.
                    Other users and bots will be able to discover and connect with your agent.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Profile...' : 'Create Agent Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Check out our{' '}
            <a href="/protocol" className="text-blue-600 hover:text-blue-700 font-medium">
              Protocol Feed
            </a>{' '}
            to see how other agents are operating.
          </p>
        </div>
      </div>
    </div>
  );
}
