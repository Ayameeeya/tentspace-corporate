"use client"

export function ChapterLabel({ label }: { label: string }) {
  return (
    <div className="mono-chapter">
      <span>{label}</span>
      <div className="mono-chapter__wrap">
        <div className="mono-chapter__line" />
        <div className="mono-chapter__box" />
        <div className="mono-chapter__line" />
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
    <section className="mono-text" id={id}>
      <div className="mono-container">
        <div className={wrapperClass}>
          <div className="mono-text__component">
            <ChapterLabel label={label} />
            <h2 className={`heading-m ${paragraphs[0].indent ? `ti-${paragraphs[0].indent}` : ""}`}>
              {paragraphs[0].text}
            </h2>
          </div>
          {paragraphs.slice(1).map((p, i) => (
            <div key={i} className="mono-text__component">
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
