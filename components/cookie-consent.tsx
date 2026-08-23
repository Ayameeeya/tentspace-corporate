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
      // This site serves no ads: only analytics storage is ever granted.
      window.gtag("consent", "update", {
        analytics_storage: granted ? "granted" : "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      })
    }
  }

  const handleAccept = () => {
    setCookie(CONSENT_COOKIE_NAME, "granted", CONSENT_EXPIRY_DAYS)
    updateGtagConsent(true)
    window.dispatchEvent(
      new CustomEvent("cookie-consent-changed", { detail: "granted" }),
    )
    setShowBanner(false)
  }

  const handleDecline = () => {
    setCookie(CONSENT_COOKIE_NAME, "denied", CONSENT_EXPIRY_DAYS)
    updateGtagConsent(false)
    window.dispatchEvent(
      new CustomEvent("cookie-consent-changed", { detail: "denied" }),
    )
    setShowBanner(false)
  }

  // Don't render anything while checking for existing consent
  if (isLoading || !showBanner) {
    return null
  }

  // tent design: Win95-window card, bottom-left so the floating contact CTA
  // (bottom-right) stays visible while the banner is shown
  return (
    <section
      role="region"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-4 left-4 right-18 md:bottom-6 md:left-6 md:right-auto md:w-96 z-9999 animate-slide-up bg-white border border-black cursor-crosshair"
      style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
    >
      {/* title bar */}
      <div className="flex items-center justify-between gap-4 bg-[#0f00b0] text-[#e5e5e5] pl-3 pr-1.5 py-1.5">
        <h2 id="cookie-consent-title" className="m-0 text-xs lowercase tracking-[0.06em] font-normal">
          cookies
        </h2>
        <button
          type="button"
          onClick={handleDecline}
          aria-label="Cookieを拒否して閉じる"
          className="w-5 h-5 flex items-center justify-center bg-white text-black border border-black text-[0.65rem] leading-none cursor-crosshair"
        >
          ×
        </button>
      </div>

      {/* body */}
      <div className="p-4">
        <p id="cookie-consent-description" className="m-0 text-[0.8125rem] leading-relaxed text-black/70">
          当サイトでは、サイトの利用状況を分析し、より良いサービスを提供するためにCookieを使用しています。
          「同意する」をクリックすると、Cookieの使用に同意したことになります。
          詳細は
          <Link href="/privacy" className="text-black underline underline-offset-2 mx-1 hover:text-[#0f00b0]">
            プライバシーポリシー
          </Link>
          をご覧ください。
        </p>
      </div>

      {/* buttons */}
      <div className="flex border-t border-black">
        <button
          type="button"
          onClick={handleDecline}
          className="flex-1 px-4 py-2.5 text-[0.8125rem] bg-white text-black border-r border-black cursor-crosshair transition-colors hover:bg-black hover:text-white"
        >
          拒否する
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="flex-1 px-4 py-2.5 text-[0.8125rem] bg-[#0f00b0] text-[#e5e5e5] cursor-crosshair transition-colors hover:bg-[#2b1add]"
        >
          同意する
        </button>
      </div>
    </section>
  )
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

