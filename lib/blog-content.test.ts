import { describe, expect, it } from "vitest"
import { DEFAULT_BLOG_AUTHOR } from "./blog-content"

describe("DEFAULT_BLOG_AUTHOR", () => {
  it("uses the selected public Supabase profile", () => {
    expect(DEFAULT_BLOG_AUTHOR).toMatchObject({
      id: "81da5c18-b6ec-4463-a751-9d9f8c269883",
      name: "Hirokuma",
      avatarUrl:
        "https://zbgzvbcgjvnsgildrmta.supabase.co/storage/v1/object/public/avatars/avatars/81da5c18-b6ec-4463-a751-9d9f8c269883-1786975082028.jpg",
    })
  })
})
