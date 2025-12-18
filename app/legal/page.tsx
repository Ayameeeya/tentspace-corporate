"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Header } from "@/components/header"
import { PageFooter } from "@/components/page-footer"

gsap.registerPlugin(ScrollTrigger)

export default function LegalPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".legal-title span", {
        y: 120,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power4.out",
      })

      gsap.from(".legal-subtitle", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power3.out",
      })

      gsap.from(".legal-section", {
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

  const basicInfo = [
    { label: "販売事業者", value: "株式会社tent space" },
    { label: "運営責任者", value: "石井 絢子" },
    { label: "所在地", value: "〒355-0316 埼玉県比企郡小川町大字角山323" },
    { label: "電話番号", value: "070-8522-9335" },
    { label: "メールアドレス", value: "back-office@tentspace.net", isEmail: true },
    { label: "ウェブサイト", value: "https://tentspace.net", isLink: true },
  ]

  const sections = [
    {
      id: "02",
      title: "販売商品・サービス",
      list: [
        "ソフトウェア開発サービス",
        "ITコンサルティングサービス",
        "AI開発サービス",
        "Webアプリケーション開発",
      ],
    },
    {
      id: "03",
      title: "販売価格",
      content:
        "各サービスの価格については、お見積り時に提示させていただきます。契約書にて最終金額をご確認の上、お手続きください。",
    },
    {
      id: "04",
      title: "商品代金以外の必要料金",
      list: [
        "インターネット接続料金",
        "通信料金（お客様のご契約内容により異なります）",
      ],
    },
    {
      id: "05",
      title: "支払方法",
      content: "銀行振込、クレジットカード決済",
    },
    {
      id: "06",
      title: "支払時期",
      content: "契約締結後、請求書発行日から30日以内",
    },
    {
      id: "07",
      title: "サービス提供時期",
      content: "契約締結後、個別に定めるスケジュールに従って提供いたします。",
    },
    {
      id: "08",
      title: "キャンセル・返金について",
      content:
        "サービスの性質上、着手後のキャンセル・返金は原則として承っておりません。ただし、当社の責に帰すべき事由によりサービス提供が不可能となった場合は、協議の上、適切に対応させていただきます。",
    },
    {
      id: "09",
      title: "免責事項",
      list: [
        "本サービスは現状有姿で提供され、特定目的への適合性を保証するものではありません",
        "サービス利用により生じた損害について、当社は一切の責任を負いません",
        "サービス内容は予告なく変更する場合があります",
      ],
    },
  ]

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
            <p className="legal-subtitle text-blue-600 text-xs md:text-sm font-medium font-tech tracking-wider mb-4 md:mb-6">
              LEGAL NOTICE
            </p>
            <h1 className="legal-title text-3xl md:text-7xl lg:text-8xl font-bold tracking-tight overflow-hidden text-foreground">
              {"特定商取引法に基づく表記".split("").map((char, i) => (
                <span key={i} className="inline-block">
                  {char}
                </span>
              ))}
            </h1>
            <div className="legal-subtitle mt-6 md:mt-8 flex items-center gap-4 md:gap-6 text-muted-foreground text-xs md:text-sm">
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
            {/* Basic Info Table */}
            <section className="legal-section mb-12 md:mb-16">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">01</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-foreground">事業者情報</h2>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                      <tbody className="divide-y divide-border">
                        {basicInfo.map((info, i) => (
                          <tr key={i} className="hover:bg-muted/50 transition-colors">
                            <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-muted-foreground bg-muted/50 w-1/3">
                              {info.label}
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground">
                              {info.isEmail ? (
                                <a
                                  href={`mailto:${info.value}`}
                                  className="text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                  {info.value}
                                </a>
                              ) : info.isLink ? (
                                <a
                                  href={info.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-500 transition-colors"
                                >
                                  {info.value}
                                </a>
                              ) : (
                                info.value
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Other Sections */}
            {sections.map((section) => (
              <section key={section.id} className="legal-section mb-12 md:mb-16 last:mb-0">
                <div className="flex items-start gap-4 md:gap-6">
                  <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">{section.id}</span>
                  <div className="flex-1">
                    <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">{section.title}</h2>
                    {section.content && (
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{section.content}</p>
                    )}
                    {section.list && (
                      <ul className="mt-3 md:mt-4 space-y-2">
                        {section.list.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base">
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 md:mt-2.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </section>
            ))}

            {/* Contact */}
            <section className="legal-section mt-12 md:mt-20 pt-12 md:pt-16 border-t border-border">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-tech mt-1.5">10</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-foreground">お問い合わせ</h2>
                  <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">
                    本ページの内容に関するお問い合わせは、下記の窓口までお願いいたします。
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
                            電話番号
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground">
                            <a href="tel:07085229335" className="text-blue-600 hover:text-blue-500 transition-colors">
                              070-8522-9335
                            </a>
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
                  <p className="text-muted-foreground text-xs md:text-sm mt-3 md:mt-4">
                    ※お問い合わせは原則メールにて承っております
                  </p>
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
