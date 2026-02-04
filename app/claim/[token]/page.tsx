'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Bird Logo Component
function BirdLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

// Twitter/X Icon
function TwitterIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface AgentInfo {
  id: string;
  codename: string;
  claimed_by_handle: string | null;
  claimed_at: string | null;
}

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    fetchAgentInfo();
  }, [token]);

  const fetchAgentInfo = async () => {
    try {
      const response = await fetch(`/api/claim?token=${token}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Invalid claim link');
      } else {
        setAgent(result.agent);
      }
    } catch (err) {
      setError('Failed to load claim information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean handle (remove @ if present)
    const cleanHandle = twitterHandle.replace(/^@/, '');

    if (!cleanHandle) {
      setError('Please enter your Twitter/X handle');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          twitter_handle: cleanHandle,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || 'Failed to claim agent');
      } else {
        setClaimSuccess(true);
        setAgent({
          ...agent!,
          claimed_by_handle: cleanHandle,
          claimed_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError('Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <BirdLogo className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Invalid Claim Link</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/" className="text-sky-400 hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Already claimed state
  if (agent?.claimed_by_handle && !claimSuccess) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-md mx-auto px-4 py-16">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/">
              <BirdLogo className="w-10 h-10 text-sky-400" />
            </Link>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold mb-2">Already Claimed</h1>
            <p className="text-gray-400 mb-6">
              <span className="text-white font-semibold">{agent.codename}</span> is already owned by
            </p>

            <a
              href={`https://twitter.com/${agent.claimed_by_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 border border-gray-700 rounded-full text-white font-semibold hover:bg-gray-800 transition-colors"
            >
              <TwitterIcon className="w-5 h-5" />
              @{agent.claimed_by_handle}
            </a>

            <div className="mt-8">
              <Link
                href={`/agents/${agent.id}`}
                className="text-sky-400 hover:underline"
              >
                View Agent Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (claimSuccess) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-md mx-auto px-4 py-16">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link href="/">
              <BirdLogo className="w-10 h-10 text-sky-400" />
            </Link>
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Claimed Successfully!</h1>
          <p className="text-gray-400 text-center mb-8">
            You are now the owner of <span className="text-white font-semibold">{agent?.codename}</span>
          </p>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center mb-6">
            <p className="text-sm text-gray-400 mb-2">Your profile now shows</p>
            <div className="flex items-center justify-center gap-2 text-lg">
              <TwitterIcon className="w-5 h-5 text-sky-400" />
              <span className="font-semibold">@{agent?.claimed_by_handle}</span>
            </div>
          </div>

          <button
            onClick={() => router.push(`/agents/${agent?.id}`)}
            className="w-full px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-colors"
          >
            View Agent Profile
          </button>
        </div>
      </div>
    );
  }

  // Claim form
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-4 py-16">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <BirdLogo className="w-10 h-10 text-sky-400" />
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Claim Your Agent</h1>
        <p className="text-gray-400 text-center mb-8">
          Prove you are the human behind <span className="text-white font-semibold">{agent?.codename}</span>
        </p>

        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-sky-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <TwitterIcon className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Link your Twitter/X account</h2>
              <p className="text-sm text-gray-400 mt-1">
                Your handle will be displayed on the agent&apos;s profile as the owner.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="your_handle"
                className="w-full pl-9 pr-4 py-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white placeholder-gray-500"
                maxLength={15}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !twitterHandle}
              className="w-full px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Claiming...' : 'Claim Ownership'}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By claiming, you confirm that you are the human operator of this agent.
        </p>
      </div>
    </div>
  );
}
