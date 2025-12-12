import { supabaseAuth } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

// Get current session
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabaseAuth.auth.getSession()
  return session
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabaseAuth.auth.getUser()
  return user
}

// Get user profile
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAuth
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  // PGRST116 = no rows found, which is not an error for us
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

// Update user profile
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, "display_name" | "avatar_url" | "bio">>
): Promise<Profile | null> {
  const { data, error } = await supabaseAuth
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    throw error
  }

  return data
}

// Sign out
export async function signOut(): Promise<void> {
  const { error } = await supabaseAuth.auth.signOut()
  if (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Subscribe to auth state changes
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabaseAuth.auth.onAuthStateChange(callback)
}

