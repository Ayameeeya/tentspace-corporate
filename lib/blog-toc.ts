export interface TocHeadingPosition {
  id: string
  top: number
}

export function getActiveHeadingId(
  headings: readonly TocHeadingPosition[],
  activationOffset: number,
): string {
  if (headings.length === 0) return ""

  let activeId = headings[0].id
  for (const heading of headings) {
    if (heading.top > activationOffset) break
    activeId = heading.id
  }

  return activeId
}

interface TocScrollTopInput {
  headingViewportTop: number
  scrollY: number
  headerHeight: number
  gap: number
}

export function getTocScrollTop({
  headingViewportTop,
  scrollY,
  headerHeight,
  gap,
}: TocScrollTopInput): number {
  return Math.max(0, scrollY + headingViewportTop - headerHeight - gap)
}
