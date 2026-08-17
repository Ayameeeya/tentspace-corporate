"use client"

import { useCallback, useEffect, useState } from "react"
import Script from "next/script"

const GA_MEASUREMENT_ID = "G-1XCFVFP5DX"
const CONSENT_EVENT_NAME = "cookie-consent-changed"

function hasAnalyticsConsent() {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie === "cookie_consent=granted")
}

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setEnabled(hasAnalyticsConsent())

    const handleConsentChange = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      setEnabled(detail === "granted")
    }

    window.addEventListener(CONSENT_EVENT_NAME, handleConsentChange)
    return () => window.removeEventListener(CONSENT_EVENT_NAME, handleConsentChange)
  }, [])

  const initializeAnalytics = useCallback(() => {
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: unknown[]) => window.dataLayer.push(args)
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    })
    window.gtag("js", new Date())
    window.gtag("config", GA_MEASUREMENT_ID)
  }, [])

  if (!enabled) return null

  return (
    <Script
      id="google-analytics-loader"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="lazyOnload"
      onLoad={initializeAnalytics}
    />
  )
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}
