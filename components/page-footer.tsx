"use client"

import Link from "next/link"
import Image from "next/image"

export function PageFooter() {
  return (
    <div className="bg-primary rounded-t-2xl md:rounded-t-3xl px-6 md:px-10 py-3 md:py-4 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/">
            <div className="hidden md:block">
              <Image
                src="/logo_black_symbol.png"
                alt="tent space"
                width={50}
                height={50}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </div>
            <div className="block md:hidden">
              <Image
                src="/logo_black_symbol.png"
                alt="tent space"
                width={40}
                height={40}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </div>
          </Link>
          <div className="text-primary-foreground/80 space-y-0.5">
            <a
              href="mailto:back-office@tentspace.net"
              className="text-xs md:text-sm font-medium hover:text-primary-foreground transition-colors inline-block"
            >
              back-office@tentspace.net
            </a>
            <p className="text-[10px] md:text-xs text-primary-foreground/60">323 Kadoyama, Ogawa, Hiki District, Saitama 355-0316, Japan</p>
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 md:gap-3 md:pb-2">
          <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs text-primary-foreground/60">
            <Link href="/about" className="hover:text-primary-foreground transition-colors">
              About Us
            </Link>
            <Link href="/terms" className="hover:text-primary-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

