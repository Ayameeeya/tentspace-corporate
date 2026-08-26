import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2"

import {
  buildContactEmail,
  handleContactRequest,
} from "@/lib/contact/handle-contact-request"

const defaultFrom = "tent space <noreply@tentspace.net>"
const defaultTo = "back-office@tentspace.net"

const ses = new SESv2Client({
  region: process.env.AWS_REGION || "ap-northeast-1",
})

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
    const result = await ses.send(
      new SendEmailCommand({
        FromEmailAddress: email.from,
        Destination: { ToAddresses: [email.to] },
        ReplyToAddresses: [email.replyTo],
        EmailTags: [
          {
            Name: "submission_id",
            Value: submission.submissionId,
          },
        ],
        Content: {
          Simple: {
            Subject: { Data: email.subject, Charset: "UTF-8" },
            Body: {
              Text: { Data: email.text, Charset: "UTF-8" },
              Html: { Data: email.html, Charset: "UTF-8" },
            },
          },
        },
      }),
    )

    if (!result.MessageId) {
      throw new Error("AWS SES did not return a message ID")
    }

    const slackWebhookUrl = process.env.CONTACT_SLACK_WEBHOOK_URL
    if (slackWebhookUrl) {
      try {
        await notifySlack(slackWebhookUrl, email.text)
      } catch (error) {
        console.error("Contact Slack notification failed", error)
      }
    }

    return { id: result.MessageId }
  })
}
