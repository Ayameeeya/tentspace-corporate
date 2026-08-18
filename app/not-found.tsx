"use client"

import { MonoShell } from "@/components/home/MonoShell"
import { ChapterLabel } from "@/components/home/ChapterText"
import { ScrambleText } from "@/components/home/ScrambleText"
import { MainBtn } from "@/components/home/MainBtn"

export default function NotFound() {
  return (
    <MonoShell footer={false}>
      <main
        id="main-content"
        className="mono-doc"
        style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: "10vh" }}
      >
        <div className="mono-container">
          <ChapterLabel label="404" />
          <ScrambleText as="h1" className="heading-xl" mode="load" intensity={5}>
            page not found
          </ScrambleText>
          <div className="mono-doc__meta" style={{ marginBottom: "4em" }}>
            <ScrambleText as="p" className="paragraph-m opacity-64" mode="load" intensity={5}>
              お探しのページは存在しないか、移動した可能性があります。
            </ScrambleText>
          </div>
          <MainBtn label="back to home" href="/" variant="inside" />
        </div>
      </main>
    </MonoShell>
  )
}
