import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { sendMock, fetchMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
  fetchMock: vi.fn(),
}))

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock }
  },
}))

import { POST } from "./route"

const originalEnv = { ...process.env }

function createRequest() {
  const formData = new FormData()
  formData.set("name", "山田 太郎")
  formData.set("email", "taro@example.com")
  formData.set("company", "株式会社Example")
  formData.set("phone", "03-1234-5678")
  formData.set("inquiry_type", "web-mobile")
  formData.set("message", "新規サービスの開発について相談したいです。")
  formData.set("submission_id", "123e4567-e89b-42d3-a456-426614174000")

  return new Request("http://localhost/api/contact", {
    method: "POST",
    body: formData,
  })
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    process.env.CONTACT_FROM_EMAIL = "tent space <noreply@tentspace.net>"
    process.env.CONTACT_TO_EMAIL = "back-office@tentspace.net"
    process.env.CONTACT_SLACK_WEBHOOK_URL = "https://hooks.slack.test/contact"
    sendMock.mockResolvedValue({ data: { id: "email_123" }, error: null })
    fetchMock.mockResolvedValue(new Response("ok", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    sendMock.mockReset()
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it("posts the inquiry to the configured Slack webhook", async () => {
    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://hooks.slack.test/contact",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    )
    const options = fetchMock.mock.calls[0]?.[1] as { body: string }
    const payload = JSON.parse(options.body)
    expect(payload.text).toBe(
      "tent space のお問い合わせフォームから新しいお問い合わせが届きました。",
    )
    expect(payload.blocks[0].text).toEqual(
      expect.objectContaining({
        type: "plain_text",
        text: expect.stringContaining("山田 太郎"),
      }),
    )
    expect(payload.blocks[0].text.text).toContain("taro@example.com")
  })

  it("keeps the successful email result when Slack is temporarily unavailable", async () => {
    fetchMock.mockResolvedValue(new Response("error", { status: 500 }))

    const response = await POST(createRequest())

    expect(response.status).toBe(200)
  })

  it("delivers the contact email through Resend", async () => {
    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "tent space <noreply@tentspace.net>",
        to: ["back-office@tentspace.net"],
        replyTo: "taro@example.com",
        tags: [
          {
            name: "submission_id",
            value: "123e4567-e89b-42d3-a456-426614174000",
          },
        ],
      }),
    )
  })

  it("uses the verified sender domain by default", async () => {
    delete process.env.CONTACT_FROM_EMAIL
    delete process.env.CONTACT_TO_EMAIL

    const response = await POST(createRequest())

    expect(response.status).toBe(200)
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "tent space <noreply@tentspace.net>",
        to: ["back-office@tentspace.net"],
      }),
    )
  })

  it("returns 502 when Resend reports a delivery error", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "application_error", message: "Unable to send email" },
    })

    const response = await POST(createRequest())

    expect(response.status).toBe(502)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
