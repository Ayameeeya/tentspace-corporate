type BlogShareInput = {
  url: string
  title: string
}

export function createInstagramShareText({ url, title }: BlogShareInput) {
  return `${title}\n${url}`
}

export function createBlogShareUrls({ url, title }: BlogShareInput) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedThreadsText = encodeURIComponent(createInstagramShareText({ url, title }))

  return {
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    threads: `https://www.threads.com/intent/post?text=${encodedThreadsText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    instagram: "https://www.instagram.com/",
  }
}
