import { describe, expect, it } from "vitest"
import { getActiveHeadingId, getTocScrollTop } from "./blog-toc"

describe("getActiveHeadingId", () => {
  const headings = [
    { id: "heading-0", top: -480 },
    { id: "heading-1", top: -40 },
    { id: "heading-2", top: 320 },
  ]

  it("selects the latest heading that has crossed the reading line", () => {
    expect(getActiveHeadingId(headings, 96)).toBe("heading-1")
  })

  it("returns the first heading before the article reaches the reading line", () => {
    expect(
      getActiveHeadingId(
        [
          { id: "heading-0", top: 240 },
          { id: "heading-1", top: 640 },
        ],
        96,
      ),
    ).toBe("heading-0")
  })

  it("returns an empty id when the article has no headings", () => {
    expect(getActiveHeadingId([], 96)).toBe("")
  })
})

describe("getTocScrollTop", () => {
  it("places the heading below the measured fixed header and reading gap", () => {
    expect(
      getTocScrollTop({
        headingViewportTop: 620,
        scrollY: 800,
        headerHeight: 72,
        gap: 24,
      }),
    ).toBe(1324)
  })

  it("does not produce a negative scroll position", () => {
    expect(
      getTocScrollTop({
        headingViewportTop: 20,
        scrollY: 0,
        headerHeight: 72,
        gap: 24,
      }),
    ).toBe(0)
  })
})
