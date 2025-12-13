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

// Delete user account
export async function deleteAccount(): Promise<void> {
  const { data: { user } } = await supabaseAuth.auth.getUser()
  
  if (!user) {
    throw new Error("ユーザーが見つかりません")
  }

  // Delete user's avatar from storage if exists
  const profile = await getProfile(user.id)
  if (profile?.avatar_url) {
    try {
      await deleteAvatar(profile.avatar_url)
    } catch (error) {
      console.error("Error deleting avatar:", error)
      // Continue with account deletion even if avatar deletion fails
    }
  }

  // Call API route to delete user (requires server-side admin access)
  const response = await fetch('/api/auth/delete-account', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'アカウントの削除に失敗しました')
  }
}

// Subscribe to auth state changes
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabaseAuth.auth.onAuthStateChange(callback)
}

// Two-Factor Authentication (2FA/MFA) functions

// Check if user has MFA enabled
export async function checkMFAStatus(): Promise<boolean> {
  try {
    const { data, error } = await supabaseAuth.auth.mfa.listFactors()
    if (error) throw error
    
    // Check if there are any verified TOTP factors
    const hasVerifiedTOTP = data?.totp?.some(factor => factor.status === 'verified')
    return hasVerifiedTOTP || false
  } catch (error) {
    console.error("Error checking MFA status:", error)
    return false
  }
}

// Enroll in MFA (get QR code)
export async function enrollMFA(): Promise<{ qrCode: string; secret: string; factorId: string } | null> {
  try {
    // First, check for any existing unverified TOTP factors and remove them
    const { data: factorsData, error: listError } = await supabaseAuth.auth.mfa.listFactors()
    
    if (!listError && factorsData?.totp) {
      // Remove any unverified TOTP factors
      for (const factor of factorsData.totp) {
        if (factor.status !== 'verified') {
          await supabaseAuth.auth.mfa.unenroll({ factorId: factor.id })
        }
      }
    }

    // Now enroll a new factor
    const { data, error } = await supabaseAuth.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator App'
    })
    
    if (error) throw error
    
    return {
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id
    }
  } catch (error) {
    console.error("Error enrolling MFA:", error)
    return null
  }
}

// Verify MFA enrollment with code
export async function verifyMFAEnrollment(factorId: string, code: string): Promise<boolean> {
  try {
    const { error } = await supabaseAuth.auth.mfa.challengeAndVerify({
      factorId,
      code
    })
    
    if (error) throw error
    return true
  } catch (error) {
    console.error("Error verifying MFA:", error)
    return false
  }
}

// Unenroll from MFA (disable 2FA)
export async function unenrollMFA(factorId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAuth.auth.mfa.unenroll({
      factorId
    })
    
    if (error) throw error
    return true
  } catch (error) {
    console.error("Error unenrolling MFA:", error)
    return false
  }
}

// Get all MFA factors
export async function getMFAFactors() {
  try {
    const { data, error } = await supabaseAuth.auth.mfa.listFactors()
    if (error) throw error
    return data
  } catch (error) {
    console.error("Error getting MFA factors:", error)
    return null
  }
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

