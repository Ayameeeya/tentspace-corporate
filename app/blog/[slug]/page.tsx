"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { getPostBySlug, getFeaturedImageUrl, formatDate, getReadingTime, type WPPost } from "@/lib/wordpress"

// Table of Contents Component
function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from content
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const elements = doc.querySelectorAll('h2, h3')
    
    const extracted = Array.from(elements).map((el, index) => {
      const id = `heading-${index}`
      const text = el.textContent || ''
      const level = el.tagName === 'H2' ? 2 : 3
      return { id, text, level }
    })
    
    setHeadings(extracted)
  }, [content])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-24 p-4 bg-gray-50 rounded-xl">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        目次
      </h3>
      <ul className="space-y-2">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-sm transition-colors ${
                level === 3 ? 'pl-3' : ''
              } ${
                activeId === id
                  ? 'text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Process content to add IDs to headings
function processContent(content: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  const headings = doc.querySelectorAll('h2, h3')
  
  headings.forEach((el, index) => {
    el.id = `heading-${index}`
  })
  
  return doc.body.innerHTML
}

// Main Blog Post Page Component
export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [post, setPost] = useState<WPPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch post
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        const fetchedPost = await getPostBySlug(resolvedParams.slug)
        if (!fetchedPost) {
          setError('記事が見つかりませんでした')
        } else {
          setPost(fetchedPost)
          setError(null)
        }
      } catch (err) {
        console.error('Failed to fetch post:', err)
        setError('記事の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [resolvedParams.slug])

  const imageUrl = post ? getFeaturedImageUrl(post, 'large') : null
  const categories = post?._embedded?.['wp:term']?.[0] || []
  const author = post?._embedded?.author?.[0]
  const readingTime = post ? getReadingTime(post.content.rendered) : 0
  const processedContent = post ? processContent(post.content.rendered) : ''

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />

      {/* Main Content */}
      <main className="pt-20">
        {loading ? (
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="aspect-[16/9] bg-gray-200 rounded-xl" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-3xl mx-auto px-4 py-24 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/blog"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ブログ一覧へ
            </Link>
          </div>
        ) : post ? (
          <>
            {/* Article Header */}
            <div className="bg-white border-b border-gray-100">
              <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
                {/* Back Link */}
                <Link
                  href="/blog"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  ブログ一覧
                </Link>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    {categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1
                  className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />

                {/* Author & Meta */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {author && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                        {author.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{author.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <time>{formatDate(post.date)}</time>
                          <span>·</span>
                          <span>{readingTime}分で読める</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Share buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.link)}&text=${encodeURIComponent(post.title.rendered)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Xでシェア"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(post.link)
                        alert('リンクをコピーしました')
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      title="リンクをコピー"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {imageUrl && (
              <div className="max-w-4xl mx-auto px-4 -mt-4 md:-mt-6">
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={imageUrl}
                    alt={post.title.rendered}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
              <div className="flex gap-8">
                {/* Main Content */}
                <article className="flex-1 min-w-0">
                  <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-10">
                    <div
                      className="article-content"
                      dangerouslySetInnerHTML={{ __html: processedContent }}
                    />
                  </div>

                  {/* Author Card */}
                  {author && (
                    <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {author.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 mb-1">{author.name}</p>
                          <p className="text-sm text-gray-600">tent space Inc.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Back to list */}
                  <div className="mt-8 text-center">
                    <Link
                      href="/blog"
                      className="inline-flex items-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      他の記事を読む
                    </Link>
                  </div>
                </article>

                {/* Sidebar - Table of Contents */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                  <TableOfContents content={post.content.rendered} />
                </aside>
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100">
              <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/logo_black_symbol.png"
                      alt="tent space"
                      width={32}
                      height={32}
                      className="opacity-60"
                    />
                    <span className="text-sm text-gray-500">© 2025 tent space Inc.</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
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
                  </div>
                </div>
              </div>
            </footer>
          </>
        ) : null}
      </main>
    </div>
  )
}
