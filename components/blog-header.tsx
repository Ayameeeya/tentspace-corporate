"use client"

import Link from "next/link"
import Image from "next/image"

export function BlogHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo - Home Link */}
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors"
            title="ホームに戻る"
          >
            <Image
              src="/logo_black_yoko.png"
              alt="tent space"
              width={90}
              height={40}
              className="h-6 md:h-7 w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4 md:gap-6">
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              About
            </Link>
            <a
              href="mailto:back-office@tentspace.net"
              className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors hidden sm:block"
            >
              お問い合わせ
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

