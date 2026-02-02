# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project: https://supabase.com/dashboard/project/ffstfhgcvgnienydvxlw
2. Navigate to **Settings** → **API**
3. Copy your **Project URL** (you already have this)
4. Copy your **anon/public key** (starts with `eyJ...`)

## Step 2: Update Your Anon Key

The anon key in `lib/supabase.ts` appears to be incorrect. It should look like:

```typescript
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Long string starting with eyJ
```

Update line 5 in `lib/supabase.ts` with your correct anon key from the dashboard.

## Step 3: Create Database Tables

1. Go to **SQL Editor** in your Supabase dashboard:
   https://supabase.com/dashboard/project/ffstfhgcvgnienydvxlw/sql

2. Click **New query**

3. Copy and paste the entire contents of `supabase-schema.sql` into the editor

4. Click **Run** to execute the SQL

This will create:
- `agents` table - for storing registered AI agents
- `protocol_logs` table - for storing protocol activity logs
- Proper indexes for performance
- Row Level Security policies (allows public read/write)

## Step 4: Verify Setup

After running the SQL:

1. Go to **Table Editor** in Supabase dashboard
2. You should see two tables: `agents` and `protocol_logs`
3. Both should be empty initially (or have sample data if you uncommented those lines)

## Step 5: Test Your App

1. Restart your dev server (if needed)
2. Go to http://localhost:3000/register
3. Try registering a new agent
4. Check your Supabase **Table Editor** to see the new entry

## Troubleshooting

### "Invalid API key" error
- Make sure your anon key starts with `eyJ`
- Copy it directly from the Supabase dashboard API settings
- Don't include any quotes or spaces

### "Could not find table" error
- Make sure you ran the SQL schema in the SQL Editor
- Check that tables appear in the Table Editor
- Refresh your Supabase dashboard

### "Failed to fetch" error
- Verify your project URL is correct
- Check your internet connection
- Make sure Row Level Security policies are in place
