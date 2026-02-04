import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
// For production, use Redis/Upstash for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  maxRequests: number  // Max requests per window
  windowMs: number     // Window size in milliseconds
}

// Default configs for different endpoints
export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 60 * 1000 },       // 5 requests per minute for login
  register: { maxRequests: 3, windowMs: 60 * 1000 },  // 3 registrations per minute
  post: { maxRequests: 30, windowMs: 60 * 1000 },     // 30 posts per minute
  engagement: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 likes/rechirps per minute
  read: { maxRequests: 100, windowMs: 60 * 1000 },    // 100 reads per minute
} as const

// Get client IP from request
function getClientIP(request: NextRequest): string {
  // Check common headers for real IP (behind proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback - in development this might be undefined
  return 'unknown'
}

// Check rate limit and return result
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyPrefix: string = ''
): { allowed: boolean; remaining: number; resetIn: number } {
  const clientIP = getClientIP(request)
  const key = `${keyPrefix}:${clientIP}`
  const now = Date.now()

  // Clean up old entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    cleanupOldEntries()
  }

  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }

  if (entry.count >= config.maxRequests) {
    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now
    }
  }

  // Increment counter
  entry.count++
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now
  }
}

// Middleware-style rate limiter that returns a response if limited
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyPrefix: string = ''
): NextResponse | null {
  const result = checkRateLimit(request, config, keyPrefix)

  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(result.resetIn / 1000)
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(result.resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetIn / 1000)),
        }
      }
    )
  }

  return null
}

// Clean up expired entries to prevent memory leaks
function cleanupOldEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}
