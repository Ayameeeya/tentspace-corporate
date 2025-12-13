import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-slate-50 light" style={{ colorScheme: 'light' }}>
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            特定商取引法に基づく表記
          </h1>
          <p className="text-slate-600">
            株式会社テントスペース
          </p>
          <p className="text-sm text-slate-500 mt-2">
            最終更新：2024年12月13日
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card className="shadow-sm bg-white border-slate-200">
          <CardContent className="p-8 md:p-12 space-y-10">
            {/* 販売事業者 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">販売事業者</h2>
              <p className="text-slate-700">株式会社テントスペース</p>
            </section>

            <Separator />

            {/* 運営責任者 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">運営責任者</h2>
              <p className="text-slate-700">石井絢子</p>
            </section>

            <Separator />

            {/* 所在地 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">所在地</h2>
              <p className="text-slate-700">〒355-0316 埼玉県比企郡小川町大字角山323</p>
            </section>

            <Separator />

            {/* ウェブサイト */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">ウェブサイト</h2>
              <a
                href="https://tentspace.net/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                https://tentspace.net/blog
              </a>
            </section>

            <Separator />

            {/* 販売商品・サービス */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">販売商品・サービス</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>AIサポート記事編集ツール（買い切りライセンス）</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>AIサポート記事編集ツール（月額サブスクリプション）</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>AIサポート記事編集ツール（年額サブスクリプション）</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* 販売価格 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">販売価格</h2>
              <p className="text-slate-700 mb-2">
                各プランの価格については、商品購入ページにて表示されます。決済画面で必ず最終金額をご確認の上、お手続きください。
              </p>
              <p className="text-sm text-slate-500">
                ※価格は予告なく変更される場合があります
              </p>
            </section>

            <Separator />

            {/* 商品代金以外の必要料金 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">商品代金以外の必要料金</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>インターネット接続料金</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>通信料金（お客様のご契約内容により異なります）</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* 支払方法 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">支払方法</h2>
              <p className="text-slate-700 mb-2">クレジットカード決済（Stripe）</p>
              <p className="text-sm text-slate-600">
                対応カード：VISA、Mastercard、American Express、JCB
              </p>
            </section>

            <Separator />

            {/* 支払時期 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">支払時期</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>買い切りライセンス：購入確定時に即時決済</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>サブスクリプション：初回は購入確定時、以降は毎月/毎年の更新日に自動決済</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* 商品の引き渡し時期 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">商品の引き渡し時期</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>決済完了後、即時利用可能（デジタル商品のため）</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>アカウント情報は登録メールアドレスに送付されます</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* 返品・交換・キャンセルについて */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">返品・交換・キャンセルについて</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-3">買い切りライセンス</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1.5">•</span>
                      <span>デジタル商品の性質上、原則として返品・返金は受け付けておりません</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1.5">•</span>
                      <span>ただし、重大な瑕疵や不具合により利用できない場合は個別に対応いたします</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800 mb-3">サブスクリプション</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start">
                      <span className="mr-2 mt-1.5">•</span>
                      <span>次回更新日の前日までに解約手続きを行うことで、次回以降の課金を停止できます</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1.5">•</span>
                      <span>既に支払い済みの料金の日割り返金には応じかねます</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-1.5">•</span>
                      <span>解約手続きは管理画面から可能です</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* 動作環境 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">動作環境</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>推奨ブラウザ：Google Chrome（最新版）、Safari（最新版）、Microsoft Edge（最新版）、Firefox（最新版）</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>インターネット接続環境必須</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>JavaScriptおよびCookieを有効にする必要があります</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* サービス提供の条件 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">サービス提供の条件</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>利用規約への同意が必要です</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>反社会的勢力に該当する場合、サービス提供をお断りする場合があります</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* 免責事項 */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">免責事項</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>本サービスは現状有姿で提供され、特定目的への適合性を保証するものではありません</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>サービス利用により生じた損害について、当社は一切の責任を負いません</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>サービス内容は予告なく変更・終了する場合があります</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* 個人情報の取り扱い */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">個人情報の取り扱い</h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>取得した個人情報は、プライバシーポリシーに基づき適切に管理します</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-1.5">•</span>
                  <span>決済処理はStripe社のシステムを利用し、クレジットカード情報は当社サーバーに保存されません</span>
                </li>
              </ul>
            </section>

            <Separator />

            {/* お問い合わせ */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">お問い合わせ</h2>
              <p className="text-slate-700 mb-6">
                本ページの内容に関するお問い合わせは、下記までお願いいたします。
              </p>
              <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg">
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">事業者名</p>
                  <p className="text-slate-900 font-medium">株式会社テントスペース</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">所在地</p>
                  <p className="text-slate-900 text-sm">〒355-0316<br />埼玉県比企郡小川町大字角山323</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">メールアドレス</p>
                  <a
                    href="mailto:back-office@tentspace.net"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    back-office@tentspace.net
                  </a>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Back to top */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ホームに戻る
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
            <p>© 2025 tent space Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-slate-900 transition-colors">
                利用規約
              </Link>
              <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/about" className="hover:text-slate-900 transition-colors">
                会社情報
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
