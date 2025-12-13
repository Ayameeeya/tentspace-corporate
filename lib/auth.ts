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

// Upload avatar image to Supabase Storage
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabaseAuth.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading avatar:", uploadError)
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabaseAuth.storage
      .from("avatars")
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error in uploadAvatar:", error)
    return null
  }
}

// Delete avatar image from Supabase Storage
export async function deleteAvatar(avatarUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(avatarUrl)
    const pathParts = url.pathname.split("/")
    const filePath = pathParts.slice(pathParts.indexOf("avatars")).join("/")

    const { error } = await supabaseAuth.storage
      .from("avatars")
      .remove([filePath])

    if (error) {
      console.error("Error deleting avatar:", error)
    }
  } catch (error) {
    console.error("Error in deleteAvatar:", error)
  }
}

