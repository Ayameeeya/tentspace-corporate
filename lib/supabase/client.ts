import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase client environment variables")
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Do not persist auth state in browser storage for this corporate site
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})
