import { createClient } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase client environment variables")
}

// Client for anonymous operations (likes, etc.) - no auth persistence
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

// Client for authenticated operations - with cookie-based auth persistence
// This allows server-side routes to access the session
export const supabaseAuth = createBrowserClient(supabaseUrl, supabaseAnonKey)
