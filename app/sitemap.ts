import type { MetadataRoute } from "next"
import { getPosts, getCategories } from "@/lib/blog-content"
import { SITE_URL } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog/seo`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog/n8n`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/legal`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Blog posts
  let blogPosts: MetadataRoute.Sitemap = []
  try {
    const { posts } = await getPosts({ perPage: 1000 })
    blogPosts = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Error fetching posts for sitemap:", error)
  }

  // Category pages
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const categories = await getCategories()
    categoryPages = categories
      .filter((cat) => cat.count > 0)
      .map((cat) => ({
        url: `${SITE_URL}/blog/categories/${cat.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error)
  }

  return [...staticPages, ...blogPosts, ...categoryPages]
}

