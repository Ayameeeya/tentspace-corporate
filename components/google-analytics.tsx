"use client"

import { useCallback, useEffect, useState } from "react"
import Script from "next/script"

const GA_MEASUREMENT_ID = "G-1XCFVFP5DX"
const CONSENT_EVENT_NAME = "cookie-consent-changed"

type AnalyticsTarget = {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

function hasAnalyticsConsent() {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie === "cookie_consent=granted")
}

export function initializeGoogleAnalytics(target: AnalyticsTarget) {
  const dataLayer = target.dataLayer || []
  target.dataLayer = dataLayer
  target.gtag = function gtag() {
    // gtag.js requires an Arguments object here; rest parameters create an ignored Array.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments)
  }
  // This site serves no ads: only analytics storage is ever granted.
  target.gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })
  target.gtag("js", new Date())
  target.gtag("config", GA_MEASUREMENT_ID)
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
    initializeGoogleAnalytics(window)
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
