import type { ReactNode } from "react"

type DialogueSide = "left" | "right"

interface DialogueSpeaker {
  displayName: string
  avatar: string
  side: DialogueSide
}

export const DIALOGUE_SPEAKERS = {
  hiro: { displayName: "Hiro", avatar: "/assets/dialogue/hiro.webp", side: "right" },
  ai: { displayName: "AI", avatar: "/assets/dialogue/ai.webp", side: "left" },
} as const satisfies Record<string, DialogueSpeaker>

export type DialogueSpeakerId = keyof typeof DIALOGUE_SPEAKERS

export const DIALOGUE_MOODS = [
  "normal",
  "troubled",
  "angry",
  "crying",
] as const
export type DialogueMood = (typeof DIALOGUE_MOODS)[number]

export const DIALOGUE_SPEAKER_IDS = Object.keys(
  DIALOGUE_SPEAKERS,
) as DialogueSpeakerId[]

export function isDialogueSpeakerId(value: string): value is DialogueSpeakerId {
  return Object.hasOwn(DIALOGUE_SPEAKERS, value)
}

export function isDialogueMood(value: string): value is DialogueMood {
  return DIALOGUE_MOODS.includes(value as DialogueMood)
}

function getDialogueSpeaker(by: string) {
  if (!isDialogueSpeakerId(by)) {
    throw new Error(
      `Unknown Dialogue speaker "${by}". Available speakers: ${DIALOGUE_SPEAKER_IDS.join(", ")}`,
    )
  }
  return DIALOGUE_SPEAKERS[by]
}

export function Dialogue({ children }: { children?: ReactNode }) {
  return (
    <section className="dialogue" role="group" aria-label="記事導入の会話">
      {children}
    </section>
  )
}

function getAvatarForMood(avatar: string, mood: DialogueMood) {
  if (mood === "normal") return avatar
  return avatar.replace(/\.webp$/, `-${mood}.webp`)
}

export function Say({
  by,
  mood = "normal",
  children,
}: {
  by: string
  mood?: DialogueMood
  children?: ReactNode
}) {
  const speaker = getDialogueSpeaker(by)

  return (
    <div
      className={`dialogue__turn dialogue__turn--${speaker.side} dialogue__turn--${by}`}
      data-dialogue-mood={mood}
    >
      <img
        className="dialogue__avatar"
        src={getAvatarForMood(speaker.avatar, mood)}
        width="384"
        height="384"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
      <div className="dialogue__message">
        <span className="dialogue__speaker-name">{speaker.displayName}</span>
        <div className="dialogue__bubble">{children}</div>
      </div>
    </div>
  )
}
