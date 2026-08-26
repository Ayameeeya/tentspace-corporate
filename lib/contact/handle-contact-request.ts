import { z } from "zod"

const inquiryLabels = {
  "web-mobile": "Web・スマホアプリ開発のご相談",
  maintenance: "保守運用の引き継ぎ・見直しのご相談",
  "portfolio-pruning": "システムや機能の整理・クローズのご相談",
  "ai-automation": "AIエージェント開発・業務自動化・DXのご相談",
  design: "サイトデザインのご相談",
  "iot-devices": "IoT・BLEデバイス連携のご相談",
  estimate: "お見積もり依頼",
  other: "その他",
} as const

const inquiryTypes = Object.keys(inquiryLabels) as [
  keyof typeof inquiryLabels,
  ...(keyof typeof inquiryLabels)[],
]

const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  company: z.string().trim().max(200),
  phone: z.string().trim().max(50),
  inquiry_type: z.enum(inquiryTypes),
  message: z.string().trim().min(1).max(10_000),
  submission_id: z.string().uuid(),
})

export type ContactSubmission = {
  name: string
  email: string
  company: string
  phone: string
  inquiryType: keyof typeof inquiryLabels
  message: string
  submissionId: string
}

export type ContactEmailSender = (input: {
  submission: ContactSubmission
}) => Promise<{ id: string }>

type ContactEmailConfig = {
  from: string
  to: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim()
}

export function buildContactEmail(
  submission: ContactSubmission,
  config: ContactEmailConfig,
) {
  const inquiryLabel = inquiryLabels[submission.inquiryType]
  const company = submission.company || "未入力"
  const phone = submission.phone || "未入力"
  const lines = [
    "tent space のお問い合わせフォームから新しいお問い合わせが届きました。",
    "",
    `お問い合わせ種別: ${inquiryLabel}`,
    `お名前: ${submission.name}`,
    `メールアドレス: ${submission.email}`,
    `会社名: ${company}`,
    `電話番号: ${phone}`,
    "",
    "お問い合わせ内容:",
    submission.message,
  ]

  return {
    from: config.from,
    to: config.to,
    replyTo: submission.email,
    subject: `【tent space お問い合わせ】${inquiryLabel} / ${singleLine(submission.name)}`,
    text: lines.join("\n"),
    html: `
      <h1>新しいお問い合わせ</h1>
      <dl>
        <dt>お問い合わせ種別</dt><dd>${escapeHtml(inquiryLabel)}</dd>
        <dt>お名前</dt><dd>${escapeHtml(submission.name)}</dd>
        <dt>メールアドレス</dt><dd>${escapeHtml(submission.email)}</dd>
        <dt>会社名</dt><dd>${escapeHtml(company)}</dd>
        <dt>電話番号</dt><dd>${escapeHtml(phone)}</dd>
      </dl>
      <h2>お問い合わせ内容</h2>
      <p style="white-space: pre-wrap">${escapeHtml(submission.message)}</p>
    `.trim(),
  }
}

function formDataValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export async function handleContactRequest(
  request: Request,
  sendEmail: ContactEmailSender,
) {
  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: "入力内容を確認してください。" }, { status: 400 })
  }

  const result = contactSubmissionSchema.safeParse({
    name: formDataValue(formData, "name"),
    email: formDataValue(formData, "email"),
    company: formDataValue(formData, "company"),
    phone: formDataValue(formData, "phone"),
    inquiry_type: formDataValue(formData, "inquiry_type"),
    message: formDataValue(formData, "message"),
    submission_id: formDataValue(formData, "submission_id"),
  })

  if (!result.success) {
    return Response.json({ error: "入力内容を確認してください。" }, { status: 400 })
  }

  const submission: ContactSubmission = {
    name: result.data.name,
    email: result.data.email,
    company: result.data.company,
    phone: result.data.phone,
    inquiryType: result.data.inquiry_type,
    message: result.data.message,
    submissionId: result.data.submission_id,
  }

  try {
    await sendEmail({ submission })
  } catch (error) {
    console.error("Contact email delivery failed", error)
    return Response.json(
      { error: "送信に失敗しました。時間をおいてもう一度お試しください。" },
      { status: 502 },
    )
  }

  return Response.json({ success: true })
}
