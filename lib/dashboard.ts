import { supabaseAuth } from "@/lib/supabase/client"

// Types
export interface UserSettings {
  id: string
  user_id: string
  profile_visibility: 'public' | 'followers' | 'private'
  show_email: boolean
  show_activity: boolean
  created_at: string
  updated_at: string
}

export interface LoginHistory {
  id: string
  user_id: string
  ip_address: string | null
  user_agent: string | null
  device_type: string | null
  browser: string | null
  os: string | null
  location: string | null
  success: boolean
  created_at: string
}

export interface DashboardStats {
  favoritesCount: number
}

// User Settings
export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabaseAuth
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user settings:', error)
    return null
  }

  // If no settings exist, create default settings
  if (!data) {
    return createDefaultUserSettings(userId)
  }

  return data
}

export async function createDefaultUserSettings(userId: string): Promise<UserSettings | null> {
  // Use upsert to avoid duplicate key errors
  const { data, error } = await supabaseAuth
    .from('user_settings')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('Error creating default user settings:', error)
    // If upsert fails, try to fetch existing settings
    const { data: existingData } = await supabaseAuth
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    return existingData
  }

  return data
}

export async function updateUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserSettings | null> {
  const { data, error } = await supabaseAuth
    .from('user_settings')
    .update(settings)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user settings:', error)
    return null
  }

  return data
}

// Login History
export async function getLoginHistory(userId: string, limit = 10): Promise<LoginHistory[]> {
  const { data, error } = await supabaseAuth
    .from('login_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching login history:', error)
    return []
  }

  return data || []
}

export async function recordLoginHistory(
  userId: string,
  info: {
    ip_address?: string
    user_agent?: string
    device_type?: string
    browser?: string
    os?: string
    location?: string
    success?: boolean
  }
): Promise<LoginHistory | null> {
  const { data, error } = await supabaseAuth
    .from('login_history')
    .insert({
      user_id: userId,
      ...info
    })
    .select()
    .single()

  if (error) {
    console.error('Error recording login history:', error)
    return null
  }

  return data
}

// Dashboard Stats
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const { count: favoritesCount } = await supabaseAuth
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    favoritesCount: favoritesCount || 0,
  }
}
