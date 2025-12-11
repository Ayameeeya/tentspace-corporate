"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface BlogFloatingCTAProps {
  scrollProgress: number
}

export function BlogFloatingCTA({ scrollProgress }: BlogFloatingCTAProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Show after scrolling past 20% and before 85%
  useEffect(() => {
    if (isDismissed) return
    
    if (scrollProgress > 0.2 && scrollProgress < 0.85) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [scrollProgress, isDismissed])

  if (isDismissed) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-8 pointer-events-none"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Close button */}
      <button
        onClick={() => setIsDismissed(true)}
        className={`absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-700 transition-all z-10 ${
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
        aria-label="閉じる"
      >
        ×
      </button>

      {/* Main CTA */}
      <Link href="/blog" className="block group">
        <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-300 ${
          isHovered ? "scale-105 shadow-2xl" : "shadow-lg"
        }`}>
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-blue-800/90" />
          
          {/* Animated background effect */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at ${50 + Math.sin(scrollProgress * Math.PI * 4) * 30}% ${50 + Math.cos(scrollProgress * Math.PI * 4) * 30}%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
            }}
          />

          {/* Content */}
          <div className="relative p-4 md:p-5">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Animated icon */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/20 flex items-center justify-center transition-transform duration-300 ${
                  isHovered ? "rotate-6 scale-110" : ""
                }`}>
                  <svg 
                    className="w-5 h-5 md:w-6 md:h-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" 
                    />
                  </svg>
                </div>
                {/* Pulse animation */}
                <div className="absolute inset-0 rounded-xl bg-white/30 animate-ping opacity-75" style={{ animationDuration: "2s" }} />
              </div>

              {/* Text */}
              <div className="text-white">
                <p className="text-[10px] md:text-xs text-white/80 font-medium tracking-wide uppercase">
                  Tech Blog
                </p>
                <p className="text-sm md:text-base font-bold leading-tight">
                  AI・テクノロジー記事
                </p>
                <p className="text-[10px] md:text-xs text-white/70 mt-0.5 hidden sm:block">
                  最新の技術情報をチェック →
                </p>
              </div>
            </div>

            {/* Hover indicator */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 transition-transform duration-300 origin-left ${
              isHovered ? "scale-x-100" : "scale-x-0"
            }`} />
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/50 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </Link>

      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(20px);
            opacity: 0;
          }
          50% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

