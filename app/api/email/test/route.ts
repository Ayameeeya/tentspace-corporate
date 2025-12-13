import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/email'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    console.log('=== Test Email API Debug ===')
    console.log('Available cookies:', allCookies.map(c => c.name))
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => allCookies,
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('User error:', userError)
    console.log('User:', user?.id, user?.email)

    if (userError || !user || !user.email) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません', debug: { error: userError?.message, cookies: allCookies.map(c => c.name) } },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    const userName = profile?.display_name || user.email.split('@')[0]

    const result = await sendTestEmail(user.email, userName)

    if (result.success) {
      return NextResponse.json({ message: 'テストメールを送信しました' })
    } else {
      return NextResponse.json(
        { message: result.error || 'メール送信に失敗しました' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in test email route:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

