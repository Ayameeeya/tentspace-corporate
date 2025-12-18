"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const CONSENT_COOKIE_NAME = "cookie_consent"
const CONSENT_EXPIRY_DAYS = 365

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if consent has already been given
    const consent = getCookie(CONSENT_COOKIE_NAME)
    if (!consent) {
      setShowBanner(true)
    } else {
      // If consent was given, update gtag consent
      updateGtagConsent(consent === "granted")
    }
    setIsLoading(false)
  }, [])

  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`
  }

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null
    }
    return null
  }

  const updateGtagConsent = (granted: boolean) => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
        ad_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied",
      })
    }
  }

  const handleAccept = () => {
    setCookie(CONSENT_COOKIE_NAME, "granted", CONSENT_EXPIRY_DAYS)
    updateGtagConsent(true)
    setShowBanner(false)
  }

  const handleDecline = () => {
    setCookie(CONSENT_COOKIE_NAME, "denied", CONSENT_EXPIRY_DAYS)
    updateGtagConsent(false)
    setShowBanner(false)
  }

  // Don't render anything while checking for existing consent
  if (isLoading || !showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg animate-slide-up">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Icon */}
        <div className="hidden md:flex w-12 h-12 rounded-full bg-blue-50 items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            Cookieの使用について
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            当サイトでは、サイトの利用状況を分析し、より良いサービスを提供するためにCookieを使用しています。
            「同意する」をクリックすると、Cookieの使用に同意したことになります。
            詳細は
            <Link href="/privacy" className="text-blue-600 hover:underline mx-1">
              プライバシーポリシー
            </Link>
            をご覧ください。
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            拒否する
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            同意する
          </button>
        </div>
      </div>
    </div>
  )
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (command: string, action: string, params?: Record<string, string>) => void
    dataLayer: unknown[]
  }
}

