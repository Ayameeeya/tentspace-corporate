"use client"

/**
 * Replaces the root layout when it crashes — must render <html>/<body> and
 * stay dependency-free (no fonts, no GSAP, no shared components, no CSS
 * imports: importing home.css here makes Turbopack preload its chunk on
 * every page, which triggers an unused-preload console warning).
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0 }}>
        <style>{`
          .ge-page {
            font-size: calc(clamp(992px, 100vw, 3840px) / 120);
            min-height: 100dvh;
            display: flex;
            align-items: center;
            background: #e5e5e5;
            color: #000;
            font-family: Arial, sans-serif;
            font-weight: 400;
            cursor: crosshair;
            overflow-x: clip;
          }
          @media (max-width: 991px) { .ge-page { font-size: calc(clamp(768px, 100vw, 991px) / 61.9375); } }
          @media (max-width: 767px) { .ge-page { font-size: calc(clamp(480px, 100vw, 767px) / 47.9375); } }
          @media (max-width: 479px) { .ge-page { font-size: calc(clamp(320px, 100vw, 479px) / 29.9375); } }
          .ge-container { width: 100%; max-width: min(100vw, calc(100dvh * 16 / 9)); margin-inline: auto; padding-inline: 2em; }
          .ge-chapter { display: flex; align-items: center; gap: 1em; font-size: 1.25em; text-transform: lowercase; margin-bottom: 2.5em; }
          .ge-chapter__wrap { display: flex; align-items: center; flex: 1; }
          .ge-chapter__line { height: 1px; background: #000; flex: 1; }
          .ge-chapter__box { width: calc(100% / 6); min-width: 4em; height: 0.75em; border: 1px solid #000; }
          .ge-heading { font-size: 6.5em; line-height: 1.2; font-weight: 400; letter-spacing: -0.01em; text-transform: lowercase; margin: 0; }
          @media (max-width: 991px) { .ge-heading { font-size: 5.25em; } }
          @media (max-width: 767px) { .ge-heading { font-size: 3.5em; } }
          @media (max-width: 479px) { .ge-heading { font-size: 2.75em; } }
          .ge-paragraph { font-size: 1.25em; line-height: 1.4; margin: 1.2em 0 2.4em; opacity: 0.64; }
          .ge-retry {
            position: relative;
            display: inline-block;
            background: none;
            border: none;
            padding: 0;
            font-family: inherit;
            font-size: 1.25em;
            line-height: 1.4;
            color: inherit;
            cursor: crosshair;
          }
          .ge-retry::after {
            content: "";
            position: absolute;
            left: 0; right: 0; bottom: -0.0625em;
            height: 0.0625em;
            background: currentColor;
          }
        `}</style>
        <div className="ge-page">
          <main style={{ width: "100%", padding: "0 2em" }}>
            <div className="ge-container">
              <div className="ge-chapter">
                <span>error</span>
                <div className="ge-chapter__wrap">
                  <div className="ge-chapter__line" />
                  <div className="ge-chapter__box" />
                  <div className="ge-chapter__line" />
                </div>
              </div>
              <h1 className="ge-heading">something went wrong</h1>
              <p className="ge-paragraph">申し訳ございません。予期しないエラーが発生しました。</p>
              <button type="button" onClick={reset} className="ge-retry">
                try again
              </button>
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
