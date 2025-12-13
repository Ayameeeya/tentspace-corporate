import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createStripeCustomer } from '@/lib/stripe'
import { createWordPressUser } from '@/lib/wordpress'

/**
 * POST /api/user/setup-accounts
 * 
 * ログイン中のユーザーに対して、StripeとWordPressアカウントを作成する
 * 既に作成済みの場合はスキップ
 */
export async function POST() {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user || !user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if email is confirmed
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: 'Email not confirmed' },
        { status: 400 }
      )
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, wordpress_user_id, display_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const results: {
      stripe?: { status: string; customerId?: string; error?: string }
      wordpress?: { status: string; userId?: number; error?: string }
    } = {}

    // Create Stripe customer if not exists
    if (!profile.stripe_customer_id) {
      const { customerId, error } = await createStripeCustomer({
        email: user.email,
        name: profile.display_name || user.user_metadata?.display_name,
        metadata: {
          supabase_user_id: user.id,
        },
      })

      if (customerId) {
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)

        results.stripe = { status: 'created', customerId }
      } else {
        results.stripe = { status: 'error', error }
      }
    } else {
      results.stripe = { status: 'already_exists', customerId: profile.stripe_customer_id }
    }

    // Create WordPress user if not exists
    if (!profile.wordpress_user_id) {
      const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')
      const username = `${baseUsername}_${user.id.slice(0, 8)}`
      
      const { userId, error } = await createWordPressUser({
        email: user.email,
        username: username,
        displayName: profile.display_name || baseUsername,
      })

      if (userId) {
        await supabase
          .from('profiles')
          .update({ wordpress_user_id: userId })
          .eq('id', user.id)

        results.wordpress = { status: 'created', userId }
      } else {
        results.wordpress = { status: 'error', error }
      }
    } else {
      results.wordpress = { status: 'already_exists', userId: profile.wordpress_user_id }
    }

    return NextResponse.json({
      message: 'Account setup complete',
      results,
    })
  } catch (error) {
    console.error('Account setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

