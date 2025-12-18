"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <div className="relative z-20">
      {/* Let's Talk Section */}
      <div className="mx-2 md:mx-8">
        <div className="bg-primary rounded-t-2xl md:rounded-t-3xl px-6 md:px-16 py-8 md:py-16">
          {/* Top label */}
          <div className="flex items-center gap-2 md:gap-3 text-background/80 mb-8 md:mb-12">
            <div className="w-6 h-6 md:w-8 md:h-8 relative flex items-center justify-center">
              <Image
                src="/logo_black_symbol.png"
                alt="tent space"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <span className="text-xs md:text-sm font-medium tracking-wide">Next step</span>
          </div>

          {/* Main content */}
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <h2 className="text-5xl md:text-8xl lg:text-9xl font-bold text-background tracking-tight">
              Let's talk
            </h2>
            <a
              href="mailto:back-office@tentspace.net"
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
            <div className="text-background/80 space-y-1">
              <a
                href="mailto:back-office@tentspace.net"
                className="text-xs md:text-base font-medium hover:text-background transition-colors inline-block"
              >
                back-office@tentspace.net
              </a>
              <p className="text-[10px] md:text-sm">323 Kadoyama, Ogawa, Hiki District, Saitama 355-0316, Japan</p>
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
          <p className="text-[8px] md:text-[9px] text-background/60">
            © 2025 tent space Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
