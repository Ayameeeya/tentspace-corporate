import { MonoShell } from "@/components/home/MonoShell"
import { ChapterLabel } from "@/components/home/ChapterText"
import { ScrambleText } from "@/components/home/ScrambleText"
import { MainBtn } from "@/components/home/MainBtn"

export const metadata = {
  title: "アクセス権限がありません | TentSpace",
  description: "このページにアクセスする権限がありません",
  robots: {
    index: false,
    follow: false,
  },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
}

export default function UnauthorizedPage() {
  return (
    <MonoShell footer={false}>
      <main
        id="main-content"
        className="mono-doc"
        style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: "10vh" }}
      >
        <div className="mono-container">
          <ChapterLabel label="403" />
          <ScrambleText as="h1" className="heading-xl" mode="load" intensity={5}>
            access denied
          </ScrambleText>
          <div className="mono-doc__meta" style={{ marginBottom: "2em" }}>
            <ScrambleText as="p" className="paragraph-m opacity-64" mode="load" intensity={5}>
              このページにアクセスする権限がありません。管理者権限が必要です。
            </ScrambleText>
          </div>
          <p className="paragraph-regular opacity-64" style={{ maxWidth: "40em", marginBottom: "4em" }}>
            このページは管理者のみがアクセスできます。アクセスが必要な場合は、システム管理者にお問い合わせください。
          </p>
          <MainBtn label="back to home" href="/" variant="inside" />
        </div>
      </main>
    </MonoShell>
  )
}
