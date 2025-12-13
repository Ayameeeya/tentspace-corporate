import { supabaseAuth } from "@/lib/supabase/client"

// Types
export interface Activity {
  id: string
  user_id: string
  type: 'like' | 'comment' | 'favorite' | 'follow'
  target_type: 'post' | 'comment' | 'user' | null
  target_id: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'new_follower' | 'new_comment' | 'new_like' | 'new_post'
  title: string
  message: string | null
  link: string | null
  is_read: boolean
  actor_id: string | null
  metadata: Record<string, any>
  created_at: string
  // Joined data
  actor?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export interface UserSettings {
  id: string
  user_id: string
  profile_visibility: 'public' | 'followers' | 'private'
  show_email: boolean
  show_activity: boolean
  email_notifications: boolean
  email_new_follower: boolean
  email_new_comment: boolean
  email_new_like: boolean
  email_newsletter: boolean
  push_notifications: boolean
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
  followersCount: number
  followingCount: number
  likesReceived: number
  commentsReceived: number
}

// Activities
export async function getRecentActivities(userId: string, limit = 10): Promise<Activity[]> {
  const { data, error } = await supabaseAuth
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching activities:', error)
    return []
  }

  return data || []
}

export async function createActivity(
  userId: string,
  type: Activity['type'],
  targetType: Activity['target_type'],
  targetId: string | null,
  metadata: Record<string, any> = {}
): Promise<Activity | null> {
  const { data, error } = await supabaseAuth
    .from('activities')
    .insert({
      user_id: userId,
      type,
      target_type: targetType,
      target_id: targetId,
      metadata
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating activity:', error)
    return null
  }

  return data
}

// Follows
export async function getFollowers(userId: string): Promise<Follow[]> {
  const { data, error } = await supabaseAuth
    .from('follows')
    .select('*')
    .eq('following_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching followers:', error)
    return []
  }

  return data || []
}

export async function getFollowing(userId: string): Promise<Follow[]> {
  const { data, error } = await supabaseAuth
    .from('follows')
    .select('*')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching following:', error)
    return []
  }

  return data || []
}

export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  const { error } = await supabaseAuth
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })

  if (error) {
    console.error('Error following user:', error)
    return false
  }

  // Create activity
  await createActivity(followerId, 'follow', 'user', followingId)

  return true
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  const { error } = await supabaseAuth
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)

  if (error) {
    console.error('Error unfollowing user:', error)
    return false
  }

  return true
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data, error } = await supabaseAuth
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()

  if (error) {
    return false
  }

  return !!data
}

// Notifications
export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const { data, error } = await supabaseAuth
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data || []
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabaseAuth
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }

  return count || 0
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabaseAuth
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    console.error('Error marking notification as read:', error)
    return false
  }

  return true
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabaseAuth
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all notifications as read:', error)
    return false
  }

  return true
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
  // Get favorites count
  const { count: favoritesCount } = await supabaseAuth
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get followers count
  const { count: followersCount } = await supabaseAuth
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', userId)

  // Get following count
  const { count: followingCount } = await supabaseAuth
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', userId)

  // For likes and comments received, we'd need to join with posts
  // For now, return 0 as placeholder
  return {
    favoritesCount: favoritesCount || 0,
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
    likesReceived: 0,
    commentsReceived: 0
  }
}

// Helper function to format activity for display
export function formatActivityMessage(activity: Activity): string {
  switch (activity.type) {
    case 'like':
      return `記事「${activity.metadata?.post_title || ''}」にいいねしました`
    case 'comment':
      return `記事「${activity.metadata?.post_title || ''}」にコメントしました`
    case 'favorite':
      return `記事「${activity.metadata?.post_title || ''}」をお気に入りに追加しました`
    case 'follow':
      return `${activity.metadata?.user_name || 'ユーザー'}をフォローしました`
    default:
      return 'アクティビティ'
  }
}

