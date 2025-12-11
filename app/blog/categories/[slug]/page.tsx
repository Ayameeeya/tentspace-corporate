import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"
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

  return {
    title: `${category.name}の記事一覧`,
    description: category.description || `${category.name}に関する記事一覧です。`,
    openGraph: {
      title: `${category.name}の記事一覧 | tent space Blog`,
      description: category.description || `${category.name}に関する記事一覧です。`,
      url: `${SITE_URL}/blog/categories/${category.slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/blog/categories/${category.slug}`,
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

// Blog Card Component
function BlogCard({ post }: { post: WPPost }) {
  const imageUrl = getFeaturedImageUrl(post, 'medium')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []
  const author = post._embedded?.author?.[0]

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="flex gap-4 py-5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-lg">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Author & Date */}
            <div className="flex items-center gap-2 mb-2">
              {author && (
                <div className="flex items-center gap-2">
                  {author.avatar_urls?.['48'] ? (
                    <Image
                      src={author.avatar_urls['48']}
                      alt={author.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-gray-600">{author.name}</span>
                </div>
              )}
              <span className="text-gray-300">·</span>
              <time className="text-sm text-gray-500">
                {formatDate(post.date)}
              </time>
            </div>

            {/* Title */}
            <h2
              className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 flex-wrap">
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {readingTime}分で読める
              </span>
            </div>
          </div>

          {/* Thumbnail */}
          {imageUrl && (
            <div className="relative w-24 h-24 md:w-32 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={imageUrl}
                alt={post.title.rendered}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}

// Featured Card for top posts
function FeaturedCard({ post }: { post: WPPost }) {
  const imageUrl = getFeaturedImageUrl(post, 'large')
  const excerpt = stripHtml(post.excerpt.rendered)
  const readingTime = getReadingTime(post.content.rendered)
  const categories = post._embedded?.['wp:term']?.[0] || []
  const author = post._embedded?.author?.[0]

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
          {/* Image */}
          {imageUrl && (
            <div className="relative aspect-[16/9] bg-gray-100">
              <Image
                src={imageUrl}
                alt={post.title.rendered}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="p-5">
            {/* Categories */}
            <div className="flex items-center gap-2 mb-3">
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-full"
                >
                  {cat.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h2
              className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Excerpt */}
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {excerpt}
            </p>

            {/* Author & Meta */}
            <div className="flex items-center justify-between">
              {author && (
                <div className="flex items-center gap-2">
                  {author.avatar_urls?.['48'] ? (
                    <Image
                      src={author.avatar_urls['48']}
                      alt={author.name}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{author.name}</span>
                    <time className="text-xs text-gray-500">
                      {formatDate(post.date)}
                    </time>
                  </div>
                </div>
              )}
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {readingTime}分
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Pagination Component
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

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter(page => 
    page === 1 || 
    page === totalPages || 
    Math.abs(page - currentPage) <= 1
  )

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="ページネーション">
      {currentPage > 1 && (
        <Link
          href={`/blog/categories/${categorySlug}?page=${currentPage - 1}`}
          className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          前へ
        </Link>
      )}
      
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          const prevPage = visiblePages[index - 1]
          const showEllipsis = prevPage && page - prevPage > 1

          return (
            <span key={page} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <Link
                href={`/blog/categories/${categorySlug}?page=${page}`}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            </span>
          )
        })}
      </div>

      {currentPage < totalPages && (
        <Link
          href={`/blog/categories/${categorySlug}?page=${currentPage + 1}`}
          className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          次へ
        </Link>
      )}
    </nav>
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
      
      <div className="min-h-screen bg-[#fafafa]">
        <BlogHeader />

        {/* Main Content */}
        <main className="pt-20">
          {/* Hero Section */}
          <div className="bg-white border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  ホーム
                </Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link href="/blog" className="hover:text-gray-900 transition-colors">
                  ブログ
                </Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium">{category.name}</span>
              </nav>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-500">カテゴリ</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-600 text-lg mb-4">
                  {category.description}
                </p>
              )}
              <p className="text-gray-500">
                {total}件の記事
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex items-center gap-1 overflow-x-auto py-3 -mx-4 px-4 scrollbar-hide">
                <Link
                  href="/blog"
                  className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  すべて
                </Link>
                {allCategories.filter(c => c.count > 0).map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog/categories/${cat.slug}`}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      cat.id === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-1.5 text-xs opacity-70">({cat.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="max-w-5xl mx-auto px-4 py-8">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">このカテゴリにはまだ記事がありません</p>
                <Link
                  href="/blog"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  すべての記事を見る
                </Link>
              </div>
            ) : (
              <>
                {/* Featured Posts */}
                {featuredPosts.length > 0 && currentPage === 1 && (
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {featuredPosts.map((post) => (
                      <FeaturedCard key={post.id} post={post} />
                    ))}
                  </div>
                )}

                {/* Regular Posts */}
                <div className="bg-white rounded-xl border border-gray-100 px-4">
                  {(currentPage === 1 ? regularPosts : posts).map((post) => (
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
          <footer className="bg-white border-t border-gray-100 mt-12">
            <div className="max-w-5xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo_black_yoko.png"
                    alt="tent space"
                    width={100}
                    height={32}
                    className="h-auto"
                  />
                  <span className="text-sm text-gray-500">© 2025 tent space Inc.</span>
                </div>
                <nav className="flex items-center gap-6 text-sm text-gray-500" aria-label="フッターナビゲーション">
                  <Link href="/about" className="hover:text-gray-900 transition-colors">
                    About
                  </Link>
                  <Link href="/terms" className="hover:text-gray-900 transition-colors">
                    利用規約
                  </Link>
                  <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                    プライバシー
                  </Link>
                  <a
                    href="mailto:back-office@tentspace.net"
                    className="hover:text-gray-900 transition-colors"
                  >
                    お問い合わせ
                  </a>
                </nav>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </>
  )
}

