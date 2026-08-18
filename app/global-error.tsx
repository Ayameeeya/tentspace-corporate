"use client"

import "./home.css"

/**
 * Replaces the root layout when it crashes — must render <html>/<body> and
 * stay dependency-free (no fonts, no GSAP, no shared components).
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0 }}>
        <div className="mono-page" style={{ minHeight: "100dvh", display: "flex", alignItems: "center" }}>
          <main style={{ width: "100%", padding: "0 2em" }}>
            <div className="mono-container">
              <div className="mono-chapter">
                <span>error</span>
                <div className="mono-chapter__wrap">
                  <div className="mono-chapter__line" />
                  <div className="mono-chapter__box" />
                  <div className="mono-chapter__line" />
                </div>
              </div>
              <h1 className="heading-xl">something went wrong</h1>
              <p className="paragraph-m opacity-64" style={{ marginTop: "1.5em", marginBottom: "3em" }}>
                申し訳ございません。予期しないエラーが発生しました。
              </p>
              <button
                type="button"
                onClick={reset}
                className="paragraph-m mono-ul mono-ul--static mono-submit"
                style={{ cursor: "crosshair" }}
              >
                try again
              </button>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
