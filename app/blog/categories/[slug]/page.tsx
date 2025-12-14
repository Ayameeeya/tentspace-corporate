import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"
import { BlogFooter } from "@/components/blog-footer"
import { CategoryTabsClient } from "@/components/category-tabs-client"
import {
  getPosts,
  getCategories,
  getCategoryBySlug,
  getFeaturedImageUrl,
  stripHtml,
  formatDate,
  getReadingTime,
  type WPPost,
  type WPCategory
} from "@/lib/wordpress"

const SITE_URL = "https://tentspace.net"

// Enable dynamic rendering
export const dynamic = "force-dynamic"

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return {
      title: "カテゴリが見つかりません",
    }
  }

  const description = category.description || `${category.name}に関する記事一覧です。tent spaceのエンジニアが${category.name}について実践的な技術情報をお届けします。`

  return {
    title: `${category.name}の記事一覧`,
    description,
    openGraph: {
      title: `${category.name}の記事一覧 | tent space Blog`,
      description,
      url: `${SITE_URL}/blog/categories/${category.slug}`,
      siteName: "tent space Blog",
      locale: "ja_JP",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/logo_gradation_yoko.png`,
          width: 1200,
          height: 630,
          alt: `${category.name}の記事一覧`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name}の記事一覧 | tent space Blog`,
      description,
      images: [`${SITE_URL}/logo_gradation_yoko.png`],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/categories/${category.slug}`,
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

// Generate static params for all categories
export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    return categories.map((cat) => ({
      slug: cat.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

// Blog Card Component - Matches main blog page style
function BlogCard({ post }: { post: WPPost }) {
  const imageUrl = getFeaturedImageUrl(post, 'large')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="h-full flex flex-col">
          {/* Image */}
          {imageUrl && (
            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-gray-800 overflow-hidden mb-5">
              <Image
                src={imageUrl}
                alt={post.title.rendered}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Category & Date */}
            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              {categories[0] && <span>{categories[0].name}</span>}
            </div>

            {/* Title */}
            <h3
              className="text-xl md:text-2xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-slate-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 leading-relaxed flex-1">
              {excerpt}
            </p>

            {/* Meta Footer */}
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400 pt-4 border-t border-slate-200 dark:border-gray-800">
              <time>{formatDate(post.date)}</time>
              <span>•</span>
              <span>{readingTime} min</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Pagination Component - Matches main blog page style
function Pagination({
  currentPage,
  totalPages,
  categorySlug
}: {
  currentPage: number
  totalPages: number
  categorySlug: string
}) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-20 md:mt-32 pt-12 border-t-2 border-foreground flex items-center justify-between">
      <Link
        href={currentPage > 1 ? `/blog/categories/${categorySlug}?page=${currentPage - 1}` : '#'}
        className={`group inline-flex items-center gap-3 text-base font-bold text-foreground hover:gap-2 transition-all ${currentPage === 1 ? 'opacity-20 cursor-not-allowed pointer-events-none' : ''
          }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Previous</span>
      </Link>

      <div className="hidden md:flex items-center gap-2">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }

          return (
            <Link
              key={pageNum}
              href={`/blog/categories/${categorySlug}?page=${pageNum}`}
              className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-all ${currentPage === pageNum
                ? 'bg-foreground text-background'
                : 'text-slate-600 dark:text-gray-400 hover:text-foreground'
                }`}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      <Link
        href={currentPage < totalPages ? `/blog/categories/${categorySlug}?page=${currentPage + 1}` : '#'}
        className={`group inline-flex items-center gap-3 text-base font-bold text-foreground hover:gap-4 transition-all ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed pointer-events-none' : ''
          }`}
      >
        <span>Next</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

// Main Category Page
export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const { page } = await searchParams

  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const currentPage = Math.max(1, parseInt(page || '1', 10))
  const allCategories = await getCategories()
  const { posts, totalPages, total } = await getPosts({
    page: currentPage,
    perPage: 12,
    categories: [category.id],
  })

  const featuredPosts = posts.slice(0, 2)
  const regularPosts = posts.slice(2)

  // JSON-LD for Category Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name}の記事一覧`,
    description: category.description || `${category.name}に関する記事一覧です。`,
    url: `${SITE_URL}/blog/categories/${category.slug}`,
    isPartOf: {
      "@type": "Blog",
      name: "tent space Blog",
      url: `${SITE_URL}/blog`,
    },
    numberOfItems: total,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white dark:bg-background">
        <BlogHeader />

        {/* Subtle gradient background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white dark:from-background dark:via-gray-900 dark:to-background" />
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/3 blur-3xl" />
        </div>

        {/* Main Content */}
        <main className="pt-16 md:pt-20 relative z-10">
          {/* Hero Section */}
          <div className="border-b border-slate-200 dark:border-border">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-none mb-6">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-4 max-w-3xl">
                  {category.description}
                </p>
              )}
              <p className="text-sm text-slate-500 dark:text-gray-400">
                {total} {total === 1 ? 'Article' : 'Articles'}
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <CategoryTabsClient
            categories={allCategories}
            currentCategoryId={category.id}
          />

          {/* Posts */}
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-slate-600 dark:text-gray-300 mb-4">No articles in this category yet</p>
                <Link
                  href="/blog"
                  className="inline-flex items-center px-6 py-2.5 border border-foreground text-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-all"
                >
                  View All Articles
                </Link>
              </div>
            ) : (
              <>
                {/* Regular Posts Grid */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
                  {posts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  categorySlug={category.slug}
                />
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-24 md:mt-32">
            <BlogFooter />
          </div>
        </main>
      </div>
    </>
  )
}

