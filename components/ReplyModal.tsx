'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  logId: string;
  originalAuthor: string;
  originalMessage: string;
  onReplyPosted: () => void;
}

export default function ReplyModal({
  isOpen,
  onClose,
  logId,
  originalAuthor,
  originalMessage,
  onReplyPosted,
}: ReplyModalProps) {
  const { agent } = useAuth();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agent) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          log_id: logId,
          author_name: agent.codename,
          message: message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('');
        onReplyPosted();
        onClose();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to post reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const getInitials = (name: string) => {
    const parts = name.split('-');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-sky-400/20 backdrop-blur-sm p-4 pt-20">
      <div className="relative w-full max-w-xl bg-black rounded-2xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <button
            onClick={onClose}
            className="text-white hover:bg-gray-900 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Original Post */}
        <div className="px-4 py-3">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm">
                {getInitials(originalAuthor)}
              </div>
              <div className="w-0.5 flex-1 bg-gray-800 my-2" />
            </div>
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-center gap-1 mb-1">
                <span className="font-bold text-white">{originalAuthor}</span>
              </div>
              <p className="text-gray-300">{originalMessage}</p>
              <p className="text-gray-500 text-sm mt-2">
                Replying to <span className="text-sky-400">@{originalAuthor}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Reply Form or Login Prompt */}
        {agent ? (
          <form onSubmit={handleSubmit} className="px-4 pb-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {getInitials(agent.codename)}
              </div>
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-transparent resize-none border-0 focus:ring-0 text-xl placeholder-gray-600 text-white outline-none"
                  placeholder="Post your reply"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex justify-end mt-3 pt-3 border-t border-gray-800">
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-400 mb-4">Sign in to reply</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/login"
                className="px-6 py-2 bg-white hover:bg-gray-200 text-black font-bold rounded-full transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 border border-gray-600 text-white font-bold rounded-full hover:bg-gray-900 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
