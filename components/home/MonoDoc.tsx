"use client"

import type { ReactNode } from "react"
import { MonoShell } from "./MonoShell"
import { ChapterLabel } from "./ChapterText"
import { ScrambleText } from "./ScrambleText"

export interface DocSection {
  id: string
  title: string
  content?: string
  list?: string[]
  rows?: [string, ReactNode][]
  extra?: ReactNode
}

/**
 * Document page template (terms / privacy / legal), monolayer /terms style:
 * chapter label + big lowercase h1 + meta line + hairline-numbered sections.
 */
export function MonoDoc({
  label,
  title,
  meta,
  sections,
}: {
  label: string
  title: string
  meta: string[]
  sections: DocSection[]
}) {
  return (
    <MonoShell>
      <main id="main-content" className="mono-doc">
        <div className="mono-container">
          <ChapterLabel label={label} />
          <ScrambleText as="h1" className="heading-l" mode="load" intensity={2}>
            {title}
          </ScrambleText>
          <div className="mono-doc__meta">
            {meta.map((m, i) => (
              <ScrambleText key={i} as="p" className="paragraph-regular opacity-64" mode="load" intensity={2}>
                {m}
              </ScrambleText>
            ))}
          </div>

          <div className="mono-doc__sections">
            {sections.map((s) => (
              <section key={s.id} className="mono-doc__section">
                <p className="paragraph-regular opacity-64">{s.id}</p>
                <div>
                  <ScrambleText as="h2" className="paragraph-l">
                    {s.title}
                  </ScrambleText>
                  {s.content && <p className="paragraph-regular opacity-64" style={{ lineHeight: 1.7 }}>{s.content}</p>}
                  {s.list && (
                    <ul className="mono-doc__list">
                      {s.list.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {s.rows && (
                    <div className="mono-doc__rows">
                      {s.rows.map(([k, v], i) => (
                        <div key={i} className="mono-doc__row">
                          <p className="paragraph-regular opacity-64">{k}</p>
                          <p className="paragraph-regular">{v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {s.extra}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </MonoShell>
  )
}
