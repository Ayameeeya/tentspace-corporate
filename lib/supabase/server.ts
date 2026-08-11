import { createClient } from "@supabase/supabase-js"

let cachedAdminClient: ReturnType<typeof createClient> | undefined

export function getSupabaseAdmin() {
  if (cachedAdminClient) return cachedAdminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase server environment variables")
  }

  cachedAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // Service role keys should never be exposed to the browser
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return cachedAdminClient
}
