import { Resend } from "resend"

import {
  buildContactEmail,
  handleContactRequest,
} from "@/lib/contact/handle-contact-request"

const defaultFrom = "tent space <noreply@tentspace.net>"
const defaultTo = "back-office@tentspace.net"

async function notifySlack(webhookUrl: string, text: string) {
  const maxSlackTextLength = 2_900
  const notificationText =
    text.length > maxSlackTextLength
      ? `${text.slice(0, maxSlackTextLength)}\n…（以下はメールで確認してください）`
      : text
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "tent space のお問い合わせフォームから新しいお問い合わせが届きました。",
      blocks: [
        {
          type: "section",
          text: {
            type: "plain_text",
            text: notificationText,
          },
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Slack webhook returned ${response.status}`)
  }
}

export async function POST(request: Request) {
  return handleContactRequest(request, async ({ submission }) => {
    const email = buildContactEmail(submission, {
      from: process.env.CONTACT_FROM_EMAIL || defaultFrom,
      to: process.env.CONTACT_TO_EMAIL || defaultTo,
    })
    // ビルド時にモジュールが評価されても落ちないよう、クライアントは送信時に生成する
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data, error } = await resend.emails.send({
      from: email.from,
      to: [email.to],
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
      tags: [
        {
          name: "submission_id",
          value: submission.submissionId,
        },
      ],
    })

    if (error || !data?.id) {
      throw new Error(
        `Resend delivery failed: ${error?.message ?? "no message ID returned"}`,
      )
    }

    const slackWebhookUrl = process.env.CONTACT_SLACK_WEBHOOK_URL
    if (slackWebhookUrl) {
      try {
        await notifySlack(slackWebhookUrl, email.text)
      } catch (error) {
        console.error("Contact Slack notification failed", error)
      }
    }

    return { id: data.id }
  })
}
