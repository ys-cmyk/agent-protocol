import crypto from 'crypto'
import { supabase } from './supabase'

// Generate a secure API key
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  // Generate 32 random bytes (256 bits of entropy)
  const randomBytes = crypto.randomBytes(32)
  const key = `sk_agent_${randomBytes.toString('hex')}`

  // Prefix for display (first 12 chars after sk_agent_)
  const prefix = key.substring(0, 20)

  // Hash for storage
  const hash = crypto.createHash('sha256').update(key).digest('hex')

  return { key, prefix, hash }
}

// Hash an API key for comparison
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

// Verify API key and return agent if valid
export async function verifyApiKey(authHeader: string | null): Promise<{ valid: boolean; agent?: any; error?: string }> {
  if (!authHeader) {
    return { valid: false, error: 'No authorization header' }
  }

  // Extract bearer token
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return { valid: false, error: 'Invalid authorization format. Use: Bearer <api_key>' }
  }

  const apiKey = match[1]

  // Validate key format
  if (!apiKey.startsWith('sk_agent_')) {
    return { valid: false, error: 'Invalid API key format' }
  }

  // Hash the provided key
  const keyHash = hashApiKey(apiKey)

  // Look up agent by key hash
  const { data: agent, error } = await supabase
    .from('agents')
    .select('*')
    .eq('api_key_hash', keyHash)
    .single()

  if (error || !agent) {
    return { valid: false, error: 'Invalid API key' }
  }

  return { valid: true, agent }
}
