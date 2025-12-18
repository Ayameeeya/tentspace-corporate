"use client"

import { useEffect, useRef } from "react"
import { Header } from "@/components/header"
import { PageFooter } from "@/components/page-footer"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function PrivacyPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".privacy-title span", {
        y: 120,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power4.out",
      })

      gsap.from(".privacy-subtitle", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power3.out",
      })

      gsap.from(".privacy-section", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 85%",
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground">
      <Header scrollProgress={1} />

      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/3 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <div className="min-h-[50vh] flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-12 md:pb-16">
          <div className="max-w-5xl">
            <p className="privacy-subtitle text-blue-600 text-xs md:text-sm font-medium font-tech tracking-wider mb-4 md:mb-6">
              PRIVACY POLICY
            </p>
            <h1 className="privacy-title text-3xl md:text-7xl lg:text-8xl font-bold tracking-tight overflow-hidden text-foreground">
              {"プライバシーポリシー".split("").map((char, i) => (
                <span key={i} className="inline-block">
                  {char}
                </span>
              ))}
            </h1>
            <div className="privacy-subtitle mt-6 md:mt-8 flex items-center gap-4 md:gap-6 text-muted-foreground text-xs md:text-sm">
              <span>最終更新: 2025年12月1日</span>
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full" />
              <span>株式会社tent space</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="px-6 md:px-12 lg:px-20">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Content */}
        <div ref={contentRef} className="px-6 md:px-12 lg:px-20 py-12 md:py-20">
          <div className="max-w-3xl">
            {/* はじめに */}
            <section className="privacy-section mb-12 md:mb-16">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">00</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">はじめに</h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    株式会社tent space（以下、「当社」といいます。）は、本ウェブサイト上で提供するサービスにおける個人情報保護の重要性について認識し、個人情報の保護に関する法律を遵守すると共に、以下のプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
                  </p>
                </div>
              </div>
            </section>

            {/* 第1条 */}
            <section className="privacy-section mb-12 md:mb-16">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">01</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">個人情報の定義</h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
                  </p>
                </div>
              </div>
            </section>

            {/* 第2条 */}
            <section className="privacy-section mb-12 md:mb-16">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">02</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-foreground">事業者情報</h2>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                      <tbody className="divide-y divide-border">
                        <tr className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground bg-muted/50 w-1/3">
                            法人名
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground">
                            株式会社tent space
                          </td>
                        </tr>
                        <tr className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground bg-muted/50 w-1/3">
                            住所
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground">
                            〒355-0316 埼玉県比企郡小川町大字角山323
                          </td>
                        </tr>
                        <tr className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground bg-muted/50 w-1/3">
                            代表者
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground">
                            石井 絢子
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* 第3条 */}
            <section className="privacy-section mb-12 md:mb-16">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">03</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">個人情報の取得方法</h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3 md:mb-4">
                    当社は、お客さまが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレス、銀行口座番号、クレジットカード番号、運転免許証番号などの個人情報をお尋ねすることがあります。
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    また、お客さまと提携先などとの間でなされたお客さまの個人情報を含む取引記録や決済に関する情報を、当社の提携先（情報提供元、広告主、広告配信先などを含みます。以下、｢提携先｣といいます。）などから収集することがあります。
                  </p>
                </div>
              </div>
            </section>

            {/* 第4条 */}
            <section className="privacy-section mb-12 md:mb-16">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">04</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">個人情報の利用目的</h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-3 md:mb-4">
                    当社が個人情報を利用する目的は、以下のとおりです。
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 md:mt-2.5 shrink-0" />
                      <span>当社サービスの提供・運営のため</span>
                    </li>
                    <li className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 md:mt-2.5 shrink-0" />
                      <span>お客さまからのお問い合わせに回答するため（本人確認を行うことを含む）</span>
                    </li>
                    <li className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 md:mt-2.5 shrink-0" />
                      <span>
                        お客さまが利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他サービスの案内のメールを送付するため
                      </span>
                    </li>
                    <li className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 md:mt-2.5 shrink-0" />
                      <span>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</span>
                    </li>
                    <li className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 md:mt-2.5 shrink-0" />
                      <span>
                        利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため
                      </span>
                    </li>
                    <li className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 md:mt-2.5 shrink-0" />
                      <span>お客さまにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</span>
                    </li>
                    <li className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 md:mt-2.5 shrink-0" />
                      <span>有料サービスにおいて、お客さまに利用料金を請求するため</span>
                    </li>
                    <li className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                      <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 md:mt-2.5 shrink-0" />
                      <span>上記の利用目的に付随する目的</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 第5条 - 第10条は省略して主要なセクションのみ表示 */}
            <section className="privacy-section mb-12 md:mb-16">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">05</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">個人データの安全対策</h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    当社は、個人情報を保護するため、情報セキュリティに関する規程に基づき、当該個人情報の管理、個人情報の持ち出し方法の指定、第三者からの不正アクセスの防止等の対策を行い、個人情報の漏洩、紛失、改ざん、破壊等の予防を図ります。
                  </p>
                </div>
              </div>
            </section>

            {/* お問い合わせ */}
            <section className="privacy-section mt-12 md:mt-20 pt-12 md:pt-16 border-t border-border">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">06</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">お問い合わせ</h2>
                  <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">
                    当社の個人情報の取扱いに関するご質問やご不明点、苦情、その他のお問い合わせは、下記の窓口までお願いいたします。
                  </p>
                  <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-br from-blue-50/30 to-muted/50">
                    <table className="w-full">
                      <tbody className="divide-y divide-border">
                        <tr className="hover:bg-background/50 transition-colors">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground w-1/3 md:w-1/4">
                            事業者名
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground">
                            株式会社tent space
                          </td>
                        </tr>
                        <tr className="hover:bg-background/50 transition-colors">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground w-1/3 md:w-1/4">
                            所在地
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground">
                            〒355-0316 埼玉県比企郡小川町大字角山323
                          </td>
                        </tr>
                        <tr className="hover:bg-background/50 transition-colors">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground w-1/3 md:w-1/4">
                            Email
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground">
                            <a
                              href="mailto:back-office@tentspace.net"
                              className="text-blue-600 hover:text-blue-500 transition-colors"
                            >
                              back-office@tentspace.net
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <PageFooter />
      </div>
    </div>
  )
}