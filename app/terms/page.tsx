"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { Header } from "@/components/header"
import { PageFooter } from "@/components/page-footer"

gsap.registerPlugin(ScrollTrigger)

function HomeButton() {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const arrowRef = useRef<SVGSVGElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const button = buttonRef.current
    const arrow = arrowRef.current
    const ripple = rippleRef.current
    const glow = glowRef.current
    if (!button || !arrow || !ripple || !glow) return

    const tl = gsap.timeline({ paused: true })

    tl.to(
      arrow,
      {
        x: -4,
        scale: 1.15,
        duration: 0.4,
        ease: "power3.out",
      },
      0,
    )
      .to(
        button,
        {
          borderColor: "#3b82f6",
          backgroundColor: "#3b82f6",
          duration: 0.3,
          ease: "power2.out",
        },
        0,
      )
      .to(
        ripple,
        {
          scale: 1.5,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        0,
      )
      .to(
        glow,
        {
          opacity: 0.4,
          scale: 1.2,
          duration: 0.3,
          ease: "power2.out",
        },
        0,
      )

    const handleEnter = () => {
      gsap.to(ripple, { scale: 1, opacity: 0.3, duration: 0 })
      tl.play()
    }

    const handleLeave = () => {
      tl.reverse()
      gsap.to(arrow, { color: "#94a3b8", duration: 0.2 })
    }

    const handleClick = () => {
      gsap.to(button, {
        scale: 0.9,
        duration: 0.1,
        ease: "power2.in",
        yoyo: true,
        repeat: 1,
      })
    }

    button.addEventListener("mouseenter", handleEnter)
    button.addEventListener("mouseleave", handleLeave)
    button.addEventListener("click", handleClick)

    // Initial animation on mount
    gsap.from(button, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      delay: 0.5,
      ease: "power3.out",
    })

    return () => {
      button.removeEventListener("mouseenter", handleEnter)
      button.removeEventListener("mouseleave", handleLeave)
      button.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <Link
      ref={buttonRef}
      href="/"
      className="relative inline-flex items-center justify-center w-14 h-14 rounded-full border border-slate-200 bg-white overflow-hidden"
    >
      <div ref={glowRef} className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-0" />
      <div ref={rippleRef} className="absolute inset-0 rounded-full bg-blue-500 scale-0 opacity-0" />
      <svg
        ref={arrowRef}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="relative z-10 text-slate-400"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Link>
  )
}

export default function TermsPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".terms-title span", {
        y: 120,
        opacity: 0,
        duration: 1,
        stagger: 0.08,
        ease: "power4.out",
      })

      gsap.from(".terms-subtitle", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power3.out",
      })

      gsap.from(".terms-section", {
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

  const sections = [
    {
      id: "01",
      title: "規約への同意",
      content:
        "株式会社tent space（以下、「当社」といいます。）のサービスにアクセスまたは使用することにより、これらの利用規約およびすべての適用法令に拘束されることに同意したものとみなされます。",
    },
    {
      id: "02",
      title: "サービスの利用",
      content:
        "当社のサービスは「現状のまま」提供され、合法的な使用のみを目的としています。すべての適用法令を遵守して当社のサービスを利用することに同意します。",
      list: [
        "当社のサービスを利用するには、少なくとも18歳である必要があります。",
        "アカウントのセキュリティを維持する責任はお客様にあります。",
        "当社のサービスを悪用したり、妨害しようとしたりしないことに同意します。",
      ],
    },
    {
      id: "03",
      title: "知的財産",
      content:
        "当社のサービスのすべてのコンテンツ、機能、および機能は当社が所有しており、国際的な著作権、商標、およびその他の知的財産法によって保護されています。",
    },
    {
      id: "04",
      title: "責任の制限",
      content:
        "当社は、お客様のサービスの使用または使用不能に起因する間接的、偶発的、特別、結果的、または懲罰的損害について責任を負いません。",
    },
    {
      id: "05",
      title: "規約の変更",
      content:
        "当社は、いつでもこれらの規約を変更する権利を留保します。重要な変更がある場合は、電子メールまたは当社のサービスを通じてユーザーに通知します。",
    },
  ]

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-slate-900">
      <Header scrollProgress={1} />

      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/3 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Hero */}
        <div className="min-h-[50vh] flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-12 md:pb-16">
          <div className="max-w-5xl">
            <p className="terms-subtitle text-blue-600 text-xs md:text-sm font-medium tracking-wider mb-4 md:mb-6">TERMS OF SERVICE</p>
            <h1 className="terms-title text-3xl md:text-7xl lg:text-8xl font-bold tracking-tight overflow-hidden text-slate-900">
              {"利用規約".split("").map((char, i) => (
                <span key={i} className="inline-block">
                  {char}
                </span>
              ))}
            </h1>
            <div className="terms-subtitle mt-6 md:mt-8 flex items-center gap-4 md:gap-6 text-slate-400 text-xs md:text-sm">
              <span>最終更新: 2025年12月1日</span>
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full" />
              <span>株式会社tent space</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="px-6 md:px-12 lg:px-20">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        {/* Content */}
        <div ref={contentRef} className="px-6 md:px-12 lg:px-20 py-12 md:py-20">
          <div className="max-w-3xl">
            {sections.map((section) => (
              <section key={section.id} className="terms-section mb-12 md:mb-16 last:mb-0">
                <div className="flex items-start gap-4 md:gap-6">
                  <span className="text-blue-500 text-xs md:text-sm font-mono mt-1.5">{section.id}</span>
                  <div className="flex-1">
                    <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-slate-800">{section.title}</h2>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">{section.content}</p>
                    {section.list && (
                      <ul className="mt-3 md:mt-4 space-y-2">
                        {section.list.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 md:gap-3 text-slate-600 text-sm md:text-base">
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
            <section className="terms-section mt-12 md:mt-20 pt-12 md:pt-16 border-t border-slate-200">
              <div className="flex items-start gap-4 md:gap-6">
                <span className="text-blue-500 text-xs md:text-sm font-mono mt-1.5">06</span>
                <div className="flex-1">
                  <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-slate-800">お問い合わせ</h2>
                  <p className="text-slate-600 text-sm md:text-base mb-4 md:mb-6">
                    これらの規約についてのお問い合わせは、下記の窓口までお願いいたします。
                  </p>
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50/30 to-slate-50/50">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-white/50 transition-colors">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-slate-500 w-1/3 md:w-1/4">
                            事業者名
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-700">
                            株式会社tent space
                          </td>
                        </tr>
                        <tr className="hover:bg-white/50 transition-colors">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-slate-500 w-1/3 md:w-1/4">
                            所在地
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-700">
                            〒355-0316 埼玉県比企郡小川町大字角山323
                          </td>
                        </tr>
                        <tr className="hover:bg-white/50 transition-colors">
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-slate-500 w-1/3 md:w-1/4">
                            Email
                          </td>
                          <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-slate-700">
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
        <div className="px-6 md:px-12 lg:px-20">
          <PageFooter />
        </div>

        {/* Copyright */}
        <Footer />
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="relative z-20 px-2 md:px-8 py-1">
      <div className="flex justify-end">
        <p className="text-[8px] md:text-[9px] text-primary-foreground/60">© 2025 tent space Inc. All rights reserved.</p>
      </div>
    </footer>
  )
}
