import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  DEFAULT_BLOG_AUTHOR,
  getFeaturedImageUrl,
  getPostBySlug,
  getPostTerms,
  getPosts,
  stripHtml,
  type BlogPost,
} from "@/lib/blog-content"
import { getRenderedPostBySlug } from "@/lib/blog-content-server"
import { SITE_URL } from "@/lib/site"
import BlogPostClient from "./blog-post-client"

export async function generateStaticParams() {
  const { posts } = await getPosts({ perPage: 1000 })
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: "記事が見つかりません",
      description: "お探しの記事は見つかりませんでした。",
    }
  }

  const plainTitle = stripHtml(post.title)
  const plainExcerpt = stripHtml(post.description).slice(0, 155)
  const imageUrl = getFeaturedImageUrl(post)
  const socialImage = imageUrl
    ? new URL(imageUrl, SITE_URL).toString()
    : `${SITE_URL}/logo_gradation_yoko.png`
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`

  return {
    title: plainTitle,
    description: plainExcerpt,
    authors: [{ name: DEFAULT_BLOG_AUTHOR.name }],
    keywords: post.tags,
    openGraph: {
      title: plainTitle,
      description: plainExcerpt,
      url: canonicalUrl,
      siteName: "tent space Blog",
      locale: "ja_JP",
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: [DEFAULT_BLOG_AUTHOR.name],
      images: [{ url: socialImage, width: 1200, height: 630, alt: plainTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: plainTitle,
      description: plainExcerpt,
      images: [socialImage],
    },
    alternates: { canonical: canonicalUrl },
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

function generateJsonLd(post: BlogPost) {
  const imageUrl = getFeaturedImageUrl(post)

  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: stripHtml(post.title),
      description: stripHtml(post.description),
      image: imageUrl ? new URL(imageUrl, SITE_URL).toString() : undefined,
      datePublished: post.date,
      dateModified: post.updated,
      author: {
        "@type": "Person",
        name: DEFAULT_BLOG_AUTHOR.name,
        description: DEFAULT_BLOG_AUTHOR.description,
        image: new URL(DEFAULT_BLOG_AUTHOR.avatarUrl, SITE_URL).toString(),
      },
      publisher: {
        "@type": "Organization",
        name: "tent space Inc.",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo_black_yoko.png` },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/blog/${post.slug}`,
      },
      url: `${SITE_URL}/blog/${post.slug}`,
      wordCount: post.wordCount,
      timeRequired: `PT${post.readingTime}M`,
      keywords: post.tags.join(", "),
      articleSection: post.tags[0] || "テクノロジー",
      inLanguage: "ja",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "ブログ",
          item: `${SITE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: stripHtml(post.title),
          item: `${SITE_URL}/blog/${post.slug}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "tent space Inc.",
      url: SITE_URL,
      logo: `${SITE_URL}/logo_black_yoko.png`,
      contactPoint: {
        "@type": "ContactPoint",
        email: "back-office@tentspace.net",
        contactType: "customer service",
      },
    },
  ]
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  const contentHtml = getRenderedPostBySlug(slug)

  if (!post || !contentHtml) notFound()

  const imageUrl = getFeaturedImageUrl(post)
  const categories = getPostTerms(post)
  const { posts: categoryPosts } = await getPosts({
    categories: post.categories.slice(0, 1),
    perPage: 4,
  })
  const relatedPosts = categoryPosts
    .filter((relatedPost) => relatedPost.id !== post.id)
    .slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd(post)) }}
      />
      <BlogPostClient
        post={post}
        contentHtml={contentHtml}
        imageUrl={imageUrl}
        categories={categories}
        author={DEFAULT_BLOG_AUTHOR}
        readingTime={post.readingTime}
        canonicalUrl={`${SITE_URL}/blog/${post.slug}`}
        relatedPosts={relatedPosts}
      />
    </>
  )
}
