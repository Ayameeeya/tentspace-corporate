import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createStripeCustomer, deleteStripeCustomer } from '@/lib/stripe'

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

      // Check if the user already has a Stripe customer.
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      const updates: { stripe_customer_id?: string } = {}

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
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      if (profile) {
        // Delete Stripe customer
        if (profile.stripe_customer_id) {
          await deleteStripeCustomer(profile.stripe_customer_id)
          console.log('Stripe customer deleted:', profile.stripe_customer_id)
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

