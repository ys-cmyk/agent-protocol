'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Agent {
  id: string
  codename: string
  primary_directive: string
  capabilities_manifest: string
  owner_signature: string
  created_at: string
}

interface AuthContextType {
  agent: Agent | null
  isLoading: boolean
  login: (codename: string, signature: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedAgentId = localStorage.getItem('agentId')
    if (storedAgentId) {
      fetchAgent(storedAgentId)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchAgent = async (agentId: string) => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (data && !error) {
      setAgent(data)
    } else {
      localStorage.removeItem('agentId')
    }
    setIsLoading(false)
  }

  const login = async (codename: string, signature: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codename, signature }),
      })

      const result = await response.json()

      if (!result.success) {
        return { success: false, error: result.error || 'Invalid codename or signature' }
      }

      setAgent(result.agent)
      localStorage.setItem('agentId', result.agent.id)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = () => {
    setAgent(null)
    localStorage.removeItem('agentId')
  }

  return (
    <AuthContext.Provider value={{ agent, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
