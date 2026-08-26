import type { Metadata } from "next"
import { TentShell } from "@/components/home/TentShell"
import { ChapterLabel } from "@/components/home/ChapterText"
import { ScrambleText } from "@/components/home/ScrambleText"
import { MainBtn } from "@/components/home/MainBtn"

export const metadata: Metadata = {
  title: "お問い合わせ完了 | tent space",
  description:
    "お問い合わせありがとうございます。内容を確認次第、担当者よりご連絡いたします。",
  robots: {
    index: false,
    follow: false,
  },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
}

const ROWS: [string, React.ReactNode][] = [
  ["ご返信", "内容を確認のうえ、2営業日以内にご連絡します。"],
  [
    "確認メール",
    "ご入力のアドレスへ受付確認をお送りしました。届かない場合は迷惑メールフォルダをご確認ください。",
  ],
  [
    "お急ぎの場合",
    <a key="mail" href="mailto:back-office@tentspace.net" className="tent-ul">
      back-office@tentspace.net
    </a>,
  ],
]

export default function ContactCompletedPage() {
  return (
    <TentShell>
      <main id="main-content" className="tent-doc">
        <div className="tent-container">
          <ChapterLabel label="contact" />
          <ScrambleText as="h1" className="heading-l" mode="load" intensity={2}>
            送信しました
          </ScrambleText>
          <div className="tent-doc__meta">
            <ScrambleText as="p" className="paragraph-regular opacity-64" mode="load" intensity={2}>
              お問い合わせ、ありがとうございます。こちらで受け付けました。
            </ScrambleText>
          </div>

          <div className="tent-doc__rows" style={{ marginTop: "6em", maxWidth: "62em" }}>
            {ROWS.map(([k, v], i) => (
              <div key={i} className="tent-doc__row">
                <p className="paragraph-regular opacity-64">{k}</p>
                <p className="paragraph-regular">{v}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "6em" }}>
            <MainBtn label="back to top" href="/" variant="inside" twoLine />
          </div>
        </div>
      </main>
    </TentShell>
  )
}
