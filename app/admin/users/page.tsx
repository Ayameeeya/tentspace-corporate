import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { UserListTable } from "@/components/admin/user-list-table"
import { UserSearchFilter } from "@/components/admin/user-search-filter"
import { UserPagination } from "@/components/admin/user-pagination"

const PER_PAGE = 20

async function getUsersData(search?: string, page: number = 1) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // 現在のユーザーを取得
  const { data: { user } } = await supabase.auth.getUser()

  // ベースクエリ
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })

  // 検索条件を適用
  if (search) {
    query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  // ページネーション
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  const { data: profiles, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error fetching users:", error)
    return { profiles: [], currentUserId: user?.id, totalCount: 0 }
  }

  return { 
    profiles: profiles || [], 
    currentUserId: user?.id,
    totalCount: count || 0
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const search = params.search
  const page = params.page ? parseInt(params.page) : 1
  const { profiles: users, currentUserId, totalCount } = await getUsersData(search, page)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ユーザー一覧</h2>
          <p className="text-muted-foreground">
            登録ユーザーの管理と編集ができます
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規ユーザーを追加
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ユーザーリスト</CardTitle>
          <CardDescription>
            {search 
              ? `「${search}」の検索結果: ${totalCount}件` 
              : `全${totalCount}件のユーザーを管理できます`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <UserSearchFilter />
          </div>

          {/* Users Table */}
          <UserListTable users={users} currentUserId={currentUserId} />

          {/* Pagination */}
          <UserPagination 
            currentPage={page} 
            totalCount={totalCount} 
            perPage={PER_PAGE} 
          />
        </CardContent>
      </Card>
    </div>
  )
}

