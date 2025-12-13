"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BlogHeader } from "@/components/blog-header"
import { AuthModal } from "@/components/auth-modal"
import { getCurrentUser } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"

const plans = [
  {
    id: "free",
    name: "Free",
    price: "¥0",
    period: "永久無料",
    description: "シンプルにブログを書きたい方に",
    features: [
      "無制限の記事作成",
      "シンプルなエディタ",
      "基本テンプレート",
      "コミュニティサポート",
    ],
    cta: "無料で始める",
    popular: false,
  },
  {
    id: "paid",
    name: "AI Pro",
    price: "¥980",
    period: "/月",
    description: "AIと一緒に効率的に執筆したい方に",
    features: [
      "Freeプランの全機能",
      "AI執筆アシスタント",
      "文章の自動校正・改善",
      "アイデア・構成提案",
      "SEO最適化サポート",
      "優先サポート",
    ],
    cta: "AIと執筆を始める",
    popular: true,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [user, setUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (currentUser?.email_confirmed_at) {
        setUser(currentUser)
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  const handleStartFree = () => {
    if (user) {
      router.push("/write")
    } else {
      setShowAuthModal(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    router.push("/write")
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto px-4 text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-sm font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AIと一緒に執筆
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            あなたに合ったプランを選ぶ
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            AIがあなたの執筆をサポート。アイデア出しから記事作成まで、
            クリエイティブな作業を効率化します。
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              月払い
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              年払い
              <span className="ml-1.5 text-xs text-green-500 font-semibold">2ヶ月分お得</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl border ${
                  plan.popular
                    ? "border-violet-500 shadow-lg shadow-violet-500/10"
                    : "border-border"
                } p-6 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-semibold rounded-full">
                      人気No.1
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">
                    {billingCycle === "yearly" && plan.price !== "¥0"
                      ? "¥800"
                      : plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${
                          plan.popular ? "text-violet-500" : "text-green-500"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleStartFree}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600 shadow-lg hover:shadow-xl"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto px-4 mt-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            よくある質問
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "AIはどのように執筆をサポートしますか？",
                a: "記事のアイデア出し、構成提案、文章の改善提案、SEO最適化のアドバイスなど、執筆の全プロセスをサポートします。",
              },
              {
                q: "無料プランでも十分使えますか？",
                a: "はい、月5記事まで作成でき、基本的なAIアシスト機能をご利用いただけます。まずは無料でお試しください。",
              },
              {
                q: "プランの変更はいつでもできますか？",
                a: "はい、いつでもアップグレード・ダウングレードが可能です。日割り計算で対応いたします。",
              },
              {
                q: "支払い方法は何がありますか？",
                a: "クレジットカード（Visa, Mastercard, JCB, American Express）に対応しています。Enterpriseプランは請求書払いも可能です。",
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-card border border-border rounded-xl p-4 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-medium text-foreground list-none">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto px-4 mt-20 text-center">
          <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 rounded-2xl p-8 border border-violet-500/20">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              まずは無料で始めてみませんか？
            </h2>
            <p className="text-muted-foreground mb-6">
              クレジットカード不要。今すぐAIと一緒に執筆を始められます。
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-medium rounded-xl hover:from-violet-600 hover:to-fuchsia-600 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              無料で始める
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Tentspace. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}

