import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">設定</h2>
        <p className="text-muted-foreground">
          システムの各種設定を管理できます
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">一般設定</TabsTrigger>
          <TabsTrigger value="email">メール設定</TabsTrigger>
          <TabsTrigger value="integrations">外部連携</TabsTrigger>
          <TabsTrigger value="security">セキュリティ</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>サイト情報</CardTitle>
              <CardDescription>
                サイトの基本情報を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">サイト名</Label>
                <Input id="site-name" defaultValue="TentSpace" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">サイト説明</Label>
                <Textarea
                  id="site-description"
                  defaultValue="AI開発・業務自動化のソリューションプロバイダー"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-url">サイトURL</Label>
                <Input id="site-url" defaultValue="https://tentspace.net" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>メンテナンスモード</Label>
                  <p className="text-sm text-muted-foreground">
                    サイトをメンテナンスモードにします
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex justify-end">
                <Button>変更を保存</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>メール設定</CardTitle>
              <CardDescription>
                メール送信に関する設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTPホスト</Label>
                <Input id="smtp-host" placeholder="smtp.example.com" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">ポート</Label>
                  <Input id="smtp-port" type="number" defaultValue="587" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">ユーザー名</Label>
                  <Input id="smtp-user" placeholder="user@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">パスワード</Label>
                <Input id="smtp-password" type="password" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="from-email">送信元メールアドレス</Label>
                <Input id="from-email" defaultValue="noreply@tentspace.net" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-name">送信元名</Label>
                <Input id="from-name" defaultValue="TentSpace" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">テストメールを送信</Button>
                <Button>変更を保存</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>外部サービス連携</CardTitle>
              <CardDescription>
                外部サービスとの連携設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WordPress連携</Label>
                    <p className="text-sm text-muted-foreground">
                      WordPressとのユーザー同期を有効にします
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wordpress-url">WordPress URL</Label>
                  <Input
                    id="wordpress-url"
                    defaultValue={process.env.NEXT_PUBLIC_WORDPRESS_API_URL}
                    disabled
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stripe連携</Label>
                    <p className="text-sm text-muted-foreground">
                      決済処理にStripeを使用します
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe-key">Stripe公開可能キー</Label>
                  <Input
                    id="stripe-key"
                    placeholder="pk_..."
                    type="password"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>CloudWatch連携</Label>
                    <p className="text-sm text-muted-foreground">
                      エラーログをCloudWatchに送信します
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cloudwatch-region">AWSリージョン</Label>
                  <Input
                    id="cloudwatch-region"
                    defaultValue="ap-northeast-1"
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>変更を保存</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>セキュリティ設定</CardTitle>
              <CardDescription>
                セキュリティに関する設定を管理します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>2段階認証を必須にする</Label>
                  <p className="text-sm text-muted-foreground">
                    全ユーザーに2段階認証を義務付けます
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>パスワードの複雑さを要求</Label>
                  <p className="text-sm text-muted-foreground">
                    強力なパスワードの使用を必須にします
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="session-timeout">セッションタイムアウト（分）</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  defaultValue="30"
                />
                <p className="text-sm text-muted-foreground">
                  ユーザーが自動的にログアウトされるまでの時間
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">最大ログイン試行回数</Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  defaultValue="5"
                />
                <p className="text-sm text-muted-foreground">
                  アカウントがロックされるまでの失敗回数
                </p>
              </div>
              <div className="flex justify-end">
                <Button>変更を保存</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

