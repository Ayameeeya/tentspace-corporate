"use client"

import { useEffect } from "react"

// dev の StrictMode 二重マウントでも一度だけ出す
let printed = false

export function ConsoleEasterEgg() {
  useEffect(() => {
    if (printed) return
    printed = true

    console.log(
      "%ctent␣%c\n\n" +
        "%c* e5e5e5f %c(HEAD -> visitor)%c コンソールを開く\n" +
        "%c* 0f00b0a %c(main)%c visitorへ\n\n" +
        "%c覗いてくれてありがとう。作る側の人ですね。\n" +
        "一緒に何かやってみたいと思ったら、ぜひ。\n" +
        "→ https://www.tentspace.net/contact",
      // tent␣ ロゴ
      "background:#0f00b0;color:#e5e5e5;font-size:20px;font-weight:700;padding:8px 14px;border-radius:2px;font-family:ui-monospace,monospace;",
      "",
      // commit 1
      "color:#a3a2c6;font-family:ui-monospace,monospace;",
      "color:#0f00b0;font-family:ui-monospace,monospace;",
      "color:inherit;font-family:ui-monospace,monospace;",
      // commit 2
      "color:#a3a2c6;font-family:ui-monospace,monospace;",
      "color:#0f00b0;font-family:ui-monospace,monospace;",
      "color:inherit;font-family:ui-monospace,monospace;",
      // message
      "color:inherit;font-family:ui-monospace,monospace;line-height:1.7;",
    )
  }, [])

  return null
}
