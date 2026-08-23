"use client"

/** deterministic short-hash so each chapter reads like a commit-log line */
function shortHash(s: string) {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(16).padStart(7, "0").slice(0, 7)
}

export function ChapterLabel({ label }: { label: string }) {
  return (
    <div className="tent-chapter">
      <span className="tent-chapter__commit">
        <span className="tent-chapter__hash">{shortHash(label)}</span>
        <span>{label}</span>
      </span>
      <div className="tent-chapter__wrap">
        <div className="tent-chapter__line" />
        <div className="tent-chapter__box" />
        <div className="tent-chapter__line" />
      </div>
    </div>
  )
}

export function ChapterTextSection({
  id,
  label,
  paragraphs,
  wrapperClass,
}: {
  id?: string
  label: string
  paragraphs: { text: React.ReactNode; indent?: 0 | 2 | 5 }[]
  wrapperClass: string
}) {
  return (
    <section className="tent-text" id={id}>
      <div className="tent-container">
        <div className={wrapperClass}>
          <div className="tent-text__component">
            <ChapterLabel label={label} />
            <h2 className={`heading-m ${paragraphs[0].indent ? `ti-${paragraphs[0].indent}` : ""}`}>
              {paragraphs[0].text}
            </h2>
          </div>
          {paragraphs.slice(1).map((p, i) => (
            <div key={i} className="tent-text__component">
              <h2 className={`heading-m ${p.indent ? `ti-${p.indent}` : ""}`}>
                {p.text}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
