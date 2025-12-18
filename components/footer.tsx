"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface FooterProps {
  copyrightClassName?: string
}

export function Footer({ copyrightClassName = "text-primary-foreground/60" }: FooterProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const arrowRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Animate section sliding up
      gsap.fromTo(
        sectionRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            end: "top 50%",
            scrub: 1,
          },
        },
      )

      // Animate text
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { x: -100, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: textRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }

      // Animate arrow
      if (arrowRef.current) {
        gsap.to(arrowRef.current, {
          x: 10,
          repeat: -1,
          yoyo: true,
          duration: 0.8,
          ease: "power2.inOut",
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="relative z-20">
      {/* Let's Talk Section */}
      <div ref={sectionRef} className="mx-2 md:mx-8">
        <div className="bg-primary rounded-t-2xl md:rounded-t-3xl px-6 md:px-16 py-8 md:py-16">
          {/* Top label */}
          <div className="flex items-center gap-2 md:gap-3 text-background/80 mb-8 md:mb-12">
            <Link href="/" className="w-6 h-6 md:w-8 md:h-8 relative flex items-center justify-center">
              <Image
                src="/logo_black_symbol.png"
                alt="tent space"
                fill
                className="object-contain brightness-0 invert"
              />
            </Link>
            <span className="text-xs md:text-sm font-medium tracking-wide">Next step</span>
          </div>

          {/* Main content */}
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <h2 ref={textRef} className="text-5xl md:text-8xl lg:text-9xl font-bold text-background tracking-tight">
              Let's talk
            </h2>
            <a
              href="mailto:back-office@tentspace.net"
              ref={arrowRef}
              className="w-12 h-12 md:w-20 md:h-20 rounded-full border-2 border-background/30 flex items-center justify-center cursor-pointer hover:bg-background/10 transition-colors shrink-0"
              aria-label="Contact us via email"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-background md:w-6 md:h-6"
              >
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>

          {/* Bottom info */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mt-8 md:mt-12">
            <div className="text-background/80 space-y-3">
              <div className="space-y-1">
                <a
                  href="mailto:back-office@tentspace.net"
                  className="text-xs md:text-base font-medium hover:text-background transition-colors inline-block"
                >
                  back-office@tentspace.net
                </a>
                <p className="text-[10px] md:text-sm">323 Kadoyama, Ogawa, Hiki District, Saitama 355-0316, Japan</p>
              </div>

              {/* SNS Icons */}
              <div className="flex items-center gap-3">
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/hiroshige-negishi-4b5255135/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-background/30 flex items-center justify-center hover:bg-background/10 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="https://x.com/hirokuma_negio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-background/30 flex items-center justify-center hover:bg-background/10 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/hirokumaxhiro/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-background/30 flex items-center justify-center hover:bg-background/10 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* LINE */}
                <a
                  href="https://line.me/R/ti/p/@tentspace"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-background/30 flex items-center justify-center hover:bg-background/10 transition-colors"
                  aria-label="LINE"
                >
                  <svg className="w-4 h-4 text-background" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 md:gap-6 mt-4 md:mt-0 text-[10px] md:text-sm text-background/60">
              <Link href="/about" className="hover:text-background transition-colors">
                About Us
              </Link>
              <Link href="/blog" className="hover:text-background transition-colors">
                Blog
              </Link>
              <Link href="/terms" className="hover:text-background transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-background transition-colors">
                Privacy
              </Link>
              <Link href="/legal" className="hover:text-background transition-colors">
                Legal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <footer className="px-2 md:px-8 py-1">
        <div className="flex justify-end">
          <p className={`text-[8px] md:text-[9px] ${copyrightClassName}`}>
            © 2025 tent space Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}