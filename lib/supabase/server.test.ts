import { afterEach, describe, expect, it, vi } from "vitest"

const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

afterEach(() => {
  if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
  else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl

  if (originalServiceRoleKey === undefined) {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  } else {
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey
  }
  vi.resetModules()
})

describe("Supabase server client", () => {
  it("環境変数がないビルドでもモジュールを読み込める", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    vi.resetModules()

    const server = await import("./server")

    expect(() => server.getSupabaseAdmin()).toThrow(
      /Missing Supabase server environment variables/,
    )
  })
})
