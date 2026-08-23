import { describe, expect, it } from "vitest"
import * as analytics from "./google-analytics"

type AnalyticsTarget = {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

type InitializeGoogleAnalytics = (
  target: AnalyticsTarget,
  analyticsConsentGranted: boolean,
) => void

function getInitializer() {
  return (
    analytics as typeof analytics & {
      initializeGoogleAnalytics?: InitializeGoogleAnalytics
    }
  ).initializeGoogleAnalytics
}

describe("initializeGoogleAnalytics", () => {
  it("同意前はdeniedのまま標準のArguments形式で初期化する", () => {
    const initializeGoogleAnalytics = getInitializer()
    expect(initializeGoogleAnalytics).toBeTypeOf("function")
    if (!initializeGoogleAnalytics) return

    const target: AnalyticsTarget = {}
    initializeGoogleAnalytics(target, false)

    expect(target.dataLayer).toHaveLength(3)
    expect(target.dataLayer?.map((command) => Array.isArray(command))).toEqual([
      false,
      false,
      false,
    ])
    expect(
      target.dataLayer?.map((command) => Object.prototype.toString.call(command)),
    ).toEqual([
      "[object Arguments]",
      "[object Arguments]",
      "[object Arguments]",
    ])
    expect(Array.from(target.dataLayer?.[0] as IArguments)).toEqual([
      "consent",
      "update",
      {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ])
    expect(Array.from(target.dataLayer?.[1] as IArguments)[0]).toBe("js")
    expect(Array.from(target.dataLayer?.[2] as IArguments)).toEqual([
      "config",
      "G-1XCFVFP5DX",
    ])
  })

  it("同意済みならanalytics_storageをgrantedへ更新する", () => {
    const initializeGoogleAnalytics = getInitializer()
    expect(initializeGoogleAnalytics).toBeTypeOf("function")
    if (!initializeGoogleAnalytics) return

    const target: AnalyticsTarget = {}
    initializeGoogleAnalytics(target, true)

    expect(Array.from(target.dataLayer?.[0] as IArguments)).toEqual([
      "consent",
      "update",
      {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ])
  })

  it("既存のdataLayerを置き換えずに命令を追加する", () => {
    const initializeGoogleAnalytics = getInitializer()
    expect(initializeGoogleAnalytics).toBeTypeOf("function")
    if (!initializeGoogleAnalytics) return

    const existingCommand = { event: "existing" }
    const dataLayer = [existingCommand]
    const target: AnalyticsTarget = { dataLayer }

    initializeGoogleAnalytics(target, false)

    expect(target.dataLayer).toBe(dataLayer)
    expect(target.dataLayer?.[0]).toBe(existingCommand)
    expect(target.dataLayer).toHaveLength(4)
  })
})
