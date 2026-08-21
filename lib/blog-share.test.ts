import { describe, expect, it } from "vitest"
import { createBlogShareUrls, createInstagramShareText } from "./blog-share"

describe("blog share links", () => {
  const url = "https://www.tentspace.net/blog/share-test?from=article"
  const title = "AI開発の相談窓口 & 活用事例"

  it("X・Threads・LinkedInの投稿画面へ記事情報を渡す", () => {
    expect(createBlogShareUrls({ url, title })).toEqual({
      x: "https://twitter.com/intent/tweet?url=https%3A%2F%2Fwww.tentspace.net%2Fblog%2Fshare-test%3Ffrom%3Darticle&text=AI%E9%96%8B%E7%99%BA%E3%81%AE%E7%9B%B8%E8%AB%87%E7%AA%93%E5%8F%A3%20%26%20%E6%B4%BB%E7%94%A8%E4%BA%8B%E4%BE%8B",
      threads: "https://www.threads.com/intent/post?text=AI%E9%96%8B%E7%99%BA%E3%81%AE%E7%9B%B8%E8%AB%87%E7%AA%93%E5%8F%A3%20%26%20%E6%B4%BB%E7%94%A8%E4%BA%8B%E4%BE%8B%0Ahttps%3A%2F%2Fwww.tentspace.net%2Fblog%2Fshare-test%3Ffrom%3Darticle",
      linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.tentspace.net%2Fblog%2Fshare-test%3Ffrom%3Darticle",
      instagram: "https://www.instagram.com/",
    })
  })

  it("Instagramへ貼り付けられる記事タイトルとURLを作る", () => {
    expect(createInstagramShareText({ url, title })).toBe(`${title}\n${url}`)
  })
})
