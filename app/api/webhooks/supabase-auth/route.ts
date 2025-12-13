import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createStripeCustomer, deleteStripeCustomer } from '@/lib/stripe'
import { createWordPressUser, deleteWordPressUser } from '@/lib/wordpress'

// Supabase Auth Webhook secret for verification
const WEBHOOK_SECRET = process.env.SUPABASE_AUTH_WEBHOOK_SECRET

interface AuthWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    email: string
    email_confirmed_at: string | null
    raw_user_meta_data: {
      display_name?: string
    }
    created_at: string
  }
  old_record?: {
    id: string
    email: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      console.error('Invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: AuthWebhookPayload = await request.json()
    console.log('Auth webhook received:', payload.type, payload.record?.id)

    // Only process confirmed users (INSERT with email_confirmed_at or UPDATE when email gets confirmed)
    if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
      const user = payload.record
      
      // Check if email is confirmed
      if (!user.email_confirmed_at) {
        console.log('Email not confirmed yet, skipping account creation')
        return NextResponse.json({ message: 'Email not confirmed' })
      }

      // Get Supabase client for database operations
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for admin operations
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: () => {},
          },
        }
      )

      // Check if user already has Stripe/WordPress IDs
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, wordpress_user_id')
        .eq('id', user.id)
        .single()

      const updates: { stripe_customer_id?: string; wordpress_user_id?: number } = {}

      // Create Stripe customer if not exists
      if (!profile?.stripe_customer_id) {
        console.log('Creating Stripe customer for:', user.email)
        const { customerId, error: stripeError } = await createStripeCustomer({
          email: user.email,
          name: user.raw_user_meta_data?.display_name,
          metadata: {
            supabase_user_id: user.id,
          },
        })

        if (customerId) {
          updates.stripe_customer_id = customerId
          console.log('Stripe customer created:', customerId)
        } else {
          console.error('Failed to create Stripe customer:', stripeError)
        }
      }

      // Create WordPress user if not exists
      if (!profile?.wordpress_user_id) {
        console.log('Creating WordPress user for:', user.email)
        
        // Generate a unique username from email
        const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
        const username = `${baseUsername}_${user.id.slice(0, 8)}`
        
        const { userId: wpUserId, error: wpError } = await createWordPressUser({
          email: user.email,
          username: username,
          displayName: user.raw_user_meta_data?.display_name || baseUsername,
        })

        if (wpUserId) {
          updates.wordpress_user_id = wpUserId
          console.log('WordPress user created:', wpUserId)
        } else {
          console.error('Failed to create WordPress user:', wpError)
        }
      }

      // Update profile with new IDs
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)

        if (updateError) {
          console.error('Failed to update profile:', updateError)
        } else {
          console.log('Profile updated with:', updates)
        }
      }

      return NextResponse.json({ 
        message: 'User accounts processed',
        stripe: updates.stripe_customer_id ? 'created' : 'skipped',
        wordpress: updates.wordpress_user_id ? 'created' : 'skipped',
      })
    }

    // Handle user deletion
    if (payload.type === 'DELETE' && payload.old_record) {
      const userId = payload.old_record.id
      console.log('User deleted, cleaning up external accounts:', userId)

      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: () => {},
          },
        }
      )

      // Get profile to find external IDs
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, wordpress_user_id')
        .eq('id', userId)
        .single()

      if (profile) {
        // Delete Stripe customer
        if (profile.stripe_customer_id) {
          await deleteStripeCustomer(profile.stripe_customer_id)
          console.log('Stripe customer deleted:', profile.stripe_customer_id)
        }

        // Delete WordPress user
        if (profile.wordpress_user_id) {
          await deleteWordPressUser(profile.wordpress_user_id)
          console.log('WordPress user deleted:', profile.wordpress_user_id)
        }
      }

      return NextResponse.json({ message: 'External accounts cleaned up' })
    }

    return NextResponse.json({ message: 'No action taken' })
  } catch (error) {
    console.error('Auth webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

