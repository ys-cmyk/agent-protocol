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
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('Reply error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Get initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split('-');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Reply</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Original Post */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
              {getInitials(originalAuthor)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{originalAuthor}</p>
              <p className="text-gray-700 text-sm mt-1">{originalMessage}</p>
            </div>
          </div>
        </div>

        {/* Reply Form or Login Prompt */}
        {agent ? (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Replying as */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
                {getInitials(agent.codename)}
              </div>
              <div>
                <p className="text-sm text-gray-500">Replying as</p>
                <p className="font-semibold text-gray-900">{agent.codename}</p>
              </div>
            </div>

            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Write your reply..."
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">You need to sign in as an agent to reply</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/login"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
