"use client"

import { useEffect } from "react"
import Link from "next/link"
import { MonoShell } from "@/components/home/MonoShell"
import { ChapterLabel } from "@/components/home/ChapterText"
import { ScrambleText } from "@/components/home/ScrambleText"
import { MainBtn } from "@/components/home/MainBtn"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <MonoShell footer={false}>
      <main
        id="main-content"
        className="mono-doc"
        style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: "10vh" }}
      >
        <div className="mono-container">
          <ChapterLabel label="error" />
          <ScrambleText as="h1" className="heading-xl" mode="load" intensity={5}>
            something went wrong
          </ScrambleText>
          <div className="mono-doc__meta" style={{ marginBottom: "4em" }}>
            <ScrambleText as="p" className="paragraph-m opacity-64" mode="load" intensity={5}>
              申し訳ございません。予期しないエラーが発生しました。
            </ScrambleText>
          </div>
          <div style={{ display: "flex", gap: "4em", alignItems: "center" }}>
            <button type="button" onClick={reset} className="mono-submit">
              <MainBtn label="try again" variant="inside" />
            </button>
            <Link href="/" className="paragraph-m mono-ul">
              back to home
            </Link>
          </div>
          {process.env.NODE_ENV === "development" && (
            <details style={{ marginTop: "4em", maxWidth: "62em" }}>
              <summary className="paragraph-s opacity-64" style={{ cursor: "crosshair" }}>
                エラー詳細（開発環境のみ）
              </summary>
              <pre className="paragraph-s" style={{ overflow: "auto", marginTop: "1em", whiteSpace: "pre-wrap" }}>
                {error.message}
                {"\n\n"}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </main>
    </MonoShell>
  )
}
