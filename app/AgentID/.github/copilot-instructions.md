# Copilot instructions for AgentID

These concise instructions orient an AI coding agent to this repository so it can be productive quickly.

**Big picture**
- **Framework:** This project uses a Next.js frontend (client-side env vars use `NEXT_PUBLIC_*`). Evidence: [AgentID/.env.local](AgentID/.env.local#L1-L3) contains `NEXT_PUBLIC_SUPABASE_*` keys.
- **Integration:** Supabase is the primary backend/data service (publishable anon key present in env). Expect database and auth calls to go through a Supabase client.

**Key files & places to inspect**
- **Env:** [AgentID/.env.local](AgentID/.env.local#L1-L3) — contains public Supabase keys; do not commit sensitive secrets.
- **Package/config:** Search for `package.json`, `next.config.js`, `tsconfig.json`, and `src/` or `app/` folders to find scripts and routing conventions.
- **Supabase usage:** Search the repo for terms `supabase`, `createClient`, `from(` to locate the Supabase client and queries.

**Workflows (how to run & test locally)**
- First check for `package.json` to determine package manager (`npm`, `yarn`, or `pnpm`). Typical commands to try:

  - `npm install` (or `yarn` / `pnpm install`)
  - `npm run dev` (or `yarn dev` / `pnpm dev`) to start Next.js in development
  - `npm run build` and `npm run start` to build and run production

- If tests exist, run `npm test` or inspect `package.json` for test scripts.

**Project-specific patterns & conventions**
- Client-side code expects public env vars to be prefixed with `NEXT_PUBLIC_`. Use that prefix for any envs exposed to the browser.
- Supabase keys in `.env.local` indicate the app calls Supabase directly from client/server code. Prefer using server-side Next API routes or server components for secret operations and only expose `NEXT_PUBLIC_` keys to the browser.
- Keep `.env.local` for local development; do not commit secrets to Git.

**Integration & communication notes**
- Supabase: look for a module that initializes `createClient` (commonly under `lib/`, `utils/`, or `services/`). Calls to Supabase will often use `.from(...)` and `.rpc(...)` patterns.
- Next.js API routes (if present under `pages/api` or `app/api`) may act as a server-side boundary to the Supabase service.

**Actionable hints for code changes**
- When adding features that interact with Supabase, search for existing table names and helpers before creating new client instances.
- Update `AgentID/.env.local` for local testing and document new env vars in the repo README.

If anything here is unclear or you'd like the agent to target specific files, tell me which areas to inspect next and I will refine this file.
