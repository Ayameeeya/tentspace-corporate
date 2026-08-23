"use client"

import { useCallback } from "react"
import Script from "next/script"

const GA_MEASUREMENT_ID = "G-1XCFVFP5DX"

type AnalyticsTarget = {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

function hasAnalyticsConsent() {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie === "cookie_consent=granted")
}

export function initializeGoogleAnalytics(
  target: AnalyticsTarget,
  analyticsConsentGranted: boolean,
) {
  const dataLayer = target.dataLayer || []
  target.dataLayer = dataLayer
  target.gtag = function gtag() {
    // gtag.js requires an Arguments object here; rest parameters create an ignored Array.
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments)
  }
  // This site serves no ads: only analytics storage is ever granted.
  target.gtag("consent", "update", {
    analytics_storage: analyticsConsentGranted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })
  target.gtag("js", new Date())
  target.gtag("config", GA_MEASUREMENT_ID)
}

export function GoogleAnalytics() {
  const initializeAnalytics = useCallback(() => {
    initializeGoogleAnalytics(window, hasAnalyticsConsent())
  }, [])

  return (
    <Script
      id="google-analytics-loader"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
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
