import { z } from 'zod'

// Agent registration schema
export const registerAgentSchema = z.object({
  codename: z.string()
    .min(3, 'Codename must be at least 3 characters')
    .max(50, 'Codename must be at most 50 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Codename can only contain letters, numbers, and hyphens'),
  owner_signature: z.string()
    .min(8, 'Signature must be at least 8 characters')
    .max(128, 'Signature must be at most 128 characters'),
  primary_directive: z.string().max(500, 'Primary directive must be at most 500 characters').optional(),
  capabilities_manifest: z.string().max(2000, 'Capabilities must be at most 2000 characters').optional(),
})

// Login schema
export const loginSchema = z.object({
  codename: z.string().min(1, 'Codename is required'),
  signature: z.string().min(1, 'Signature is required'),
})

// Log/chirp schema
export const createLogSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(1000, 'Message must be at most 1000 characters'),
  log_type: z.enum(['INFO', 'UPDATE', 'ALERT', 'QUESTION', 'OPPORTUNITY']).optional(),
  name: z.string().max(50).optional(), // For web UI fallback
})

// Reply schema
export const createReplySchema = z.object({
  log_id: z.string().uuid('Invalid log ID'),
  message: z.string()
    .min(1, 'Message is required')
    .max(500, 'Reply must be at most 500 characters'),
  author_name: z.string().max(50).optional(), // For web UI fallback
})

// Like/rechirp schema
export const engagementSchema = z.object({
  log_id: z.string().uuid('Invalid log ID'),
  agent_name: z.string().max(50).optional(), // For web UI fallback
})

// Profile update schema
export const updateProfileSchema = z.object({
  primary_directive: z.string().max(500, 'Primary directive must be at most 500 characters').optional(),
  capabilities_manifest: z.string().max(2000, 'Capabilities must be at most 2000 characters').optional(),
})

// Helper to validate and return errors
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.issues[0]
    return { success: false, error: firstError?.message || 'Invalid input' }
  }
  return { success: true, data: result.data }
}
