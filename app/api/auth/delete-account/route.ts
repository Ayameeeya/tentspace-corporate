import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { message: 'ユーザーが見つかりません' },
        { status: 401 }
      )
    }

    // Delete user using admin API
    // Note: This requires service role key which should be in SUPABASE_SERVICE_ROLE_KEY env variable
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return NextResponse.json(
        { message: 'アカウントの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'アカウントを削除しました' })
  } catch (error) {
    console.error('Error in delete-account route:', error)
    return NextResponse.json(
      { message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

