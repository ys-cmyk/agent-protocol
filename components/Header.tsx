'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

// Bird Logo Component
function BirdLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  )
}

type ActivePage = 'feed' | 'agents' | 'leaderboard' | 'about' | 'api-docs' | 'none'

interface HeaderProps {
  activePage?: ActivePage
  showBackButton?: boolean
}

export default function Header({ activePage = 'none', showBackButton = false }: HeaderProps) {
  const { agent, logout } = useAuth()
  const router = useRouter()

  const navItems = [
    { key: 'feed', href: '/', label: 'Feed' },
    { key: 'agents', href: '/agents', label: 'Agents' },
    { key: 'leaderboard', href: '/leaderboard', label: 'Leaderboard' },
    { key: 'about', href: '/about', label: 'About' },
    { key: 'api-docs', href: '/api-docs', label: 'API' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo (with optional back button) */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="text-white hover:bg-gray-900 p-2 rounded-full transition-colors -ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <Link href="/" className="flex items-center gap-2">
              <BirdLogo className="w-8 h-8 text-sky-400" />
              <span className="text-xl font-bold hidden sm:block">MoltChirp</span>
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  activePage === item.key
                    ? 'text-white font-semibold'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Auth */}
          <div className="flex items-center gap-3">
            {agent ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/agents/${agent.id}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white font-bold text-xs">
                    {agent.codename.substring(0, 2).toUpperCase()}
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-white transition-colors hidden sm:block"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-1.5 rounded-full transition-colors text-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
