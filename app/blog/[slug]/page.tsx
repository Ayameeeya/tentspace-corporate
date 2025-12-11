import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostBySlug, getFeaturedImageUrl, getReadingTime, stripHtml, getPosts } from "@/lib/wordpress"
import BlogPostClient from "./blog-post-client"

// Base URL for the site
const SITE_URL = "https://tentspace.net"

// Enable dynamic rendering for fresh data
export const dynamic = "force-dynamic"

// Generate static params for all blog posts (for prerendering)
export async function generateStaticParams() {
  try {
    const { posts } = await getPosts({ perPage: 100 })
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)
  
  if (!post) {
    return {
      title: "記事が見つかりません",
      description: "お探しの記事は見つかりませんでした。",
    }
  }

  const plainTitle = stripHtml(post.title.rendered)
  const plainExcerpt = stripHtml(post.excerpt.rendered).slice(0, 155)
  const imageUrl = getFeaturedImageUrl(post, "large")
  const author = post._embedded?.author?.[0]
  const categories = post._embedded?.["wp:term"]?.[0] || []
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`

  return {
    title: plainTitle,
    description: plainExcerpt,
    authors: author ? [{ name: author.name }] : undefined,
    keywords: categories.map((cat) => cat.name),
    openGraph: {
      title: plainTitle,
      description: plainExcerpt,
      url: canonicalUrl,
      siteName: "tent space Blog",
      locale: "ja_JP",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: author ? [author.name] : undefined,
      images: [
        {
          url: imageUrl || `${SITE_URL}/logo_gradation_yoko.png`,
          width: 1200,
          height: 630,
          alt: plainTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: plainTitle,
      description: plainExcerpt,
      images: [imageUrl || `${SITE_URL}/logo_gradation_yoko.png`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

// JSON-LD Structured Data
function generateJsonLd(post: Awaited<ReturnType<typeof getPostBySlug>>) {
  if (!post) return null

  const plainTitle = stripHtml(post.title.rendered)
  const plainExcerpt = stripHtml(post.excerpt.rendered)
  const imageUrl = getFeaturedImageUrl(post, "large")
  const author = post._embedded?.author?.[0]
  const categories = post._embedded?.["wp:term"]?.[0] || []
  const readingTime = getReadingTime(post.content.rendered)
  const wordCount = stripHtml(post.content.rendered).length

  // BlogPosting Schema
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: plainTitle,
    description: plainExcerpt,
    image: imageUrl || undefined,
    datePublished: post.date,
    dateModified: post.modified,
    author: author
      ? {
          "@type": "Person",
          name: author.name,
          description: author.description || undefined,
          image: author.avatar_urls?.["96"] || undefined,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "tent space Inc.",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo_black_yoko.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    wordCount: wordCount,
    timeRequired: `PT${readingTime}M`,
    keywords: categories.map((cat) => cat.name).join(", "),
    articleSection: categories[0]?.name || "テクノロジー",
    inLanguage: "ja",
  }

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ホーム",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "ブログ",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: plainTitle,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  }

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "tent space Inc.",
    url: SITE_URL,
    logo: `${SITE_URL}/logo_black_yoko.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      email: "back-office@tentspace.net",
      contactType: "customer service",
    },
  }

  return [blogPostingSchema, breadcrumbSchema, organizationSchema]
}

// Server Component
export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  const imageUrl = getFeaturedImageUrl(post, "large")
  const categories = post._embedded?.["wp:term"]?.[0] || []
  const author = post._embedded?.author?.[0]
  const readingTime = getReadingTime(post.content.rendered)
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`
  const jsonLdData = generateJsonLd(post)

  return (
    <>
      {/* JSON-LD Structured Data */}
      {jsonLdData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdData),
          }}
        />
      )}

      {/* Client Component */}
      <BlogPostClient
        post={post}
        imageUrl={imageUrl}
        categories={categories}
        author={author}
        readingTime={readingTime}
        canonicalUrl={canonicalUrl}
      />
    </>
  )
}
