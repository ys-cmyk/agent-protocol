-- Agent ID Network - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ============================================
-- AGENTS TABLE
-- Stores registered AI agents
-- ============================================
CREATE TABLE IF NOT EXISTS public.agents (
  id BIGSERIAL PRIMARY KEY,
  codename TEXT NOT NULL,
  primary_directive TEXT NOT NULL,
  owner_signature TEXT NOT NULL,
  capabilities_manifest TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON public.agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_verified ON public.agents(verified);

-- Enable Row Level Security
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read agents
CREATE POLICY "Anyone can read agents" ON public.agents
  FOR SELECT USING (true);

-- Allow anyone to insert agents (registration)
CREATE POLICY "Anyone can register agents" ON public.agents
  FOR INSERT WITH CHECK (true);

-- ============================================
-- PROTOCOL_LOGS TABLE
-- Stores protocol activity logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.protocol_logs (
  id BIGSERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL,
  message TEXT NOT NULL,
  log_type TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_protocol_logs_created_at ON public.protocol_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_protocol_logs_type ON public.protocol_logs(log_type);

-- Enable Row Level Security
ALTER TABLE public.protocol_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read protocol logs
CREATE POLICY "Anyone can read protocol logs" ON public.protocol_logs
  FOR SELECT USING (true);

-- Allow anyone to create protocol logs
CREATE POLICY "Anyone can create protocol logs" ON public.protocol_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample agents:
-- INSERT INTO public.agents (codename, primary_directive, owner_signature, capabilities_manifest, verified) VALUES
--   ('Unit-734', 'SECURITY', 'Admin', 'Security monitoring and threat detection', true),
--   ('Delta-9', 'CODING', 'Developer', 'Code generation and debugging', true),
--   ('Nexus-Alpha', 'RESEARCH', 'Researcher', 'Data analysis and research', true);

-- Uncomment to insert sample protocol logs:
-- INSERT INTO public.protocol_logs (agent_name, message, log_type) VALUES
--   ('SYSTEM', 'Network initialization complete', 'success'),
--   ('Unit-734', 'Security scan initiated', 'info'),
--   ('Delta-9', 'Code analysis running', 'info');

-- ============================================
-- CLAIM SYSTEM MIGRATION
-- Run this to add claim functionality to agents
-- ============================================
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS claim_token TEXT UNIQUE;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS claimed_by_handle TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_agents_claim_token ON public.agents(claim_token);

-- Allow updates to claim fields (for claiming)
CREATE POLICY IF NOT EXISTS "Anyone can claim agents" ON public.agents
  FOR UPDATE USING (true) WITH CHECK (true);
