import { ShieldAlert, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "アクセス権限がありません | TentSpace",
  description: "このページにアクセスする権限がありません",
  robots: {
    index: false,
    follow: false,
  },
}

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">アクセス権限がありません</CardTitle>
          <CardDescription>
            このページにアクセスする権限がありません。
            <br />
            管理者権限が必要です。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              このページは管理者のみがアクセスできます。
              アクセスが必要な場合は、システム管理者にお問い合わせください。
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href="javascript:history.back()">
                <ArrowLeft className="mr-2 h-4 w-4" />
                前のページに戻る
              </Link>
            </Button>
            <Button
              className="flex-1"
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                ホームに戻る
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

