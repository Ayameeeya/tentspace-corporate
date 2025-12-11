import type { MetadataRoute } from "next"
import { getPosts, getCategories } from "@/lib/wordpress"

const SITE_URL = "https://tentspace.net"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Blog posts
  let blogPosts: MetadataRoute.Sitemap = []
  try {
    const { posts } = await getPosts({ perPage: 100 })
    blogPosts = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.modified),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Error fetching posts for sitemap:", error)
  }

  // Categories (optional - if you have category pages)
  // let categoryPages: MetadataRoute.Sitemap = []
  // try {
  //   const categories = await getCategories()
  //   categoryPages = categories
  //     .filter((cat) => cat.count > 0)
  //     .map((cat) => ({
  //       url: `${SITE_URL}/blog/category/${cat.slug}`,
  //       lastModified: new Date(),
  //       changeFrequency: "weekly" as const,
  //       priority: 0.6,
  //     }))
  // } catch (error) {
  //   console.error("Error fetching categories for sitemap:", error)
  // }

  return [...staticPages, ...blogPosts]
}

