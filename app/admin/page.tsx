import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Users, Package, DollarSign, TrendingUp } from "lucide-react"

async function getStats() {
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

  // ユーザー数を取得
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // TODO: 実際のデータソースに応じて調整
  const stats = {
    totalUsers: usersCount || 0,
    totalProducts: 0, // 商品管理機能実装後に更新
    totalRevenue: 0, // Stripe連携後に更新
    growth: 0,
  }

  return stats
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    {
      title: "総ユーザー数",
      value: stats.totalUsers.toLocaleString(),
      description: "登録ユーザー数",
      icon: Users,
      trend: "+12.5%",
    },
    {
      title: "総商品数",
      value: stats.totalProducts.toLocaleString(),
      description: "登録商品数",
      icon: Package,
      trend: "+5.2%",
    },
    {
      title: "総売上",
      value: `¥${stats.totalRevenue.toLocaleString()}`,
      description: "今月の売上",
      icon: DollarSign,
      trend: "+18.3%",
    },
    {
      title: "成長率",
      value: `${stats.growth}%`,
      description: "前月比",
      icon: TrendingUp,
      trend: "+2.1%",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ダッシュボード</h2>
        <p className="text-muted-foreground">
          システムの概要と主要な指標を確認できます
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stat.trend} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>
              システムの最新の動きを確認できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    新規ユーザー登録
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2時間前
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    商品が追加されました
                  </p>
                  <p className="text-sm text-muted-foreground">
                    5時間前
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    設定が更新されました
                  </p>
                  <p className="text-sm text-muted-foreground">
                    1日前
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>
              よく使う機能へのショートカット
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              新規ユーザーを追加
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              新規商品を追加
            </button>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              レポートを表示
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

