import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { env } from '@/config/env'

/**
 * Creates a Supabase client authenticated with the service role key.
 *
 * WARNING: This client bypasses Row Level Security entirely.
 * Use only in server-side background jobs and sync services.
 * Never use in route handlers that respond to user requests,
 * and never expose to the browser.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(env.supabase.url, env.supabase.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
