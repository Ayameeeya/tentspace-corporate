import { describe, expect, it, vi } from "vitest"

import {
  buildContactEmail,
  handleContactRequest,
  type ContactEmailSender,
} from "./handle-contact-request"

const submissionId = "123e4567-e89b-42d3-a456-426614174000"

function createRequest(overrides: Record<string, string> = {}) {
  const formData = new FormData()
  const values = {
    name: "山田 太郎",
    email: "taro@example.com",
    company: "株式会社Example",
    phone: "03-1234-5678",
    inquiry_type: "web-mobile",
    message: "新規サービスの開発について相談したいです。",
    submission_id: submissionId,
    ...overrides,
  }

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value)
  }

  return new Request("http://localhost/api/contact", {
    method: "POST",
    body: formData,
  })
}

describe("handleContactRequest", () => {
  it("rejects an invalid email address without sending", async () => {
    const sendEmail = vi.fn<ContactEmailSender>()

    const response = await handleContactRequest(
      createRequest({ email: "not-an-email" }),
      sendEmail,
    )

    expect(response.status).toBe(400)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("sends a validated submission with its tracking ID", async () => {
    const sendEmail = vi.fn<ContactEmailSender>().mockResolvedValue({
      id: "email_123",
    })

    const response = await handleContactRequest(createRequest(), sendEmail)

    expect(response.status).toBe(200)
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        submission: expect.objectContaining({
          name: "山田 太郎",
          email: "taro@example.com",
          inquiryType: "web-mobile",
          submissionId,
        }),
      }),
    )
  })

  it("returns a gateway error when the email provider fails", async () => {
    const sendEmail = vi
      .fn<ContactEmailSender>()
      .mockRejectedValue(new Error("provider unavailable"))

    const response = await handleContactRequest(createRequest(), sendEmail)

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: "送信に失敗しました。時間をおいてもう一度お試しください。",
    })
  })
})

describe("buildContactEmail", () => {
  it("escapes user input in the HTML body", () => {
    const email = buildContactEmail(
      {
        name: "<script>alert(1)</script>",
        email: "taro@example.com",
        company: "A & B",
        phone: "",
        inquiryType: "other",
        message: "<b>相談</b>",
        submissionId,
      },
      {
        from: "tent space <contact@tentspace.net>",
        to: "back-office@tentspace.net",
      },
    )

    expect(email.html).not.toContain("<script>")
    expect(email.html).not.toContain("<b>相談</b>")
    expect(email.html).toContain("A &amp; B")
  })
})
