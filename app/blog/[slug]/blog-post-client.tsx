"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"
import { BlogComments } from "@/components/blog-comments"
import { BlogFavorite } from "@/components/blog-favorite"
import { formatDate, getReadingTime, stripHtml, getFeaturedImageUrl, type WPPost, type WPAuthor, type WPTerm } from "@/lib/wordpress"
import { addLike, fetchHasLiked, fetchLikeCounts, getClientId } from "@/lib/blog-likes"

// Heading structure type
interface HeadingSection {
  id: string
  text: string
  level: number
  children: { id: string; text: string; level: number }[]
}

// Table of Contents Component with Accordion
function TableOfContents({ content }: { content: string }) {
  const [sections, setSections] = useState<HeadingSection[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    // Extract headings from content and group by h2
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const elements = doc.querySelectorAll('h2, h3')
    
    const grouped: HeadingSection[] = []
    let currentSection: HeadingSection | null = null

    Array.from(elements).forEach((el, index) => {
      const id = `heading-${index}`
      const text = el.textContent || ''
      const level = el.tagName === 'H2' ? 2 : 3

      if (level === 2) {
        currentSection = { id, text, level, children: [] }
        grouped.push(currentSection)
      } else if (level === 3 && currentSection) {
        currentSection.children.push({ id, text, level })
      }
    })
    
    setSections(grouped)
    if (grouped.length > 0) {
      setActiveSection(grouped[0].id)
      setActiveId(grouped[0].id)
    }
  }, [content])

  useEffect(() => {
    if (sections.length === 0) return

    const timeoutId = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id
              setActiveId(id)
              
              for (const section of sections) {
                if (section.id === id) {
                  setActiveSection(section.id)
                  break
                }
                for (const child of section.children) {
                  if (child.id === id) {
                    setActiveSection(section.id)
                    break
                  }
                }
              }
            }
          })
        },
        { rootMargin: '-100px 0px -80% 0px' }
      )

      sections.forEach((section) => {
        const element = document.getElementById(section.id)
        if (element) observer.observe(element)
        section.children.forEach((child) => {
          const childElement = document.getElementById(child.id)
          if (childElement) observer.observe(childElement)
        })
      })

      ;(window as unknown as { __tocObserver?: IntersectionObserver }).__tocObserver = observer
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      const observer = (window as unknown as { __tocObserver?: IntersectionObserver }).__tocObserver
      if (observer) observer.disconnect()
    }
  }, [sections])

  if (sections.length === 0) return null

  return (
    <nav className="sticky top-24 p-4 bg-muted rounded-xl max-h-[calc(100vh-120px)] overflow-y-auto" aria-label="目次">
      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        目次
      </h3>
      <ul className="space-y-1">
        {sections.map((section) => {
          const isOpen = activeSection === section.id
          const isActive = activeId === section.id

          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={`flex items-center gap-1 py-1.5 text-sm transition-colors ${
                  isActive ? 'text-blue-500 font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section.children.length > 0 && (
                  <svg
                    className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <span className={section.children.length === 0 ? 'ml-4' : ''}>{section.text}</span>
              </a>

              {section.children.length > 0 && isOpen && (
                <ul className="mt-1 space-y-0.5">
                  {section.children.map((child) => (
                    <li key={child.id}>
                      <a
                        href={`#${child.id}`}
                        className={`block py-1 pl-7 text-xs transition-colors ${
                          activeId === child.id ? 'text-blue-500 font-medium' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {child.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// Share Button Component
function ShareButtons({ url, title }: { url: string; title: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    alert('リンクをコピーしました')
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
        title="Xでシェア"
        aria-label="Xでシェア"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <button
        onClick={handleCopy}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
        title="リンクをコピー"
        aria-label="リンクをコピー"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      </button>
    </div>
  )
}

// Like button (Supabase)
function BlogLikeButton({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null)
  const [hasLiked, setHasLiked] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const clientId = getClientId()
    if (!clientId) return

    async function load() {
      try {
        const counts = await fetchLikeCounts([slug])
        setCount(counts[slug] || 0)
        const liked = await fetchHasLiked(slug, clientId)
        setHasLiked(liked)
      } catch (err) {
        console.error("Failed to fetch likes", err)
      }
    }
    load()
  }, [slug])

  const handleLike = async () => {
    if (pending || hasLiked) return
    const clientId = getClientId()
    if (!clientId) return

    setPending(true)
    setError(null)
    try {
      const { inserted } = await addLike(slug, clientId, typeof navigator !== "undefined" ? navigator.userAgent : undefined)
      setHasLiked(true)
      if (inserted) {
        setCount((c) => (c ?? 0) + 1)
      }
    } catch (err) {
      console.error("Failed to like post", err)
      setError("いいねに失敗しました")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleLike}
        disabled={pending || hasLiked}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-colors ${hasLiked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'border-border text-muted-foreground hover:bg-muted'}`}
        aria-pressed={hasLiked}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-6.75-4.35-6.75-9.75A4.25 4.25 0 0112 7.25a4.25 4.25 0 016.75 4c0 5.4-6.75 9.75-6.75 9.75z" />
        </svg>
        <span className="font-medium">{count ?? '–'}</span>
        <span className="text-xs text-muted-foreground">{hasLiked ? 'ありがとう！' : 'いいね'}</span>
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

// Process content to add IDs to headings (server-safe)
function processContent(content: string): string {
  // Add IDs to headings using regex (works on both server and client)
  let headingIndex = 0
  return content.replace(/<(h[23])([^>]*)>/gi, (match, tag, attrs) => {
    const id = `heading-${headingIndex++}`
    // Check if there's already an id attribute
    if (attrs.includes('id=')) {
      return match
    }
    return `<${tag}${attrs} id="${id}">`
  })
}

// Props type
interface BlogPostClientProps {
  post: WPPost
  imageUrl: string | null
  categories: WPTerm[]
  author: WPAuthor | undefined
  readingTime: number
  canonicalUrl: string
  relatedPosts?: WPPost[]
}

// Main Blog Post Client Component
export default function BlogPostClient({ 
  post, 
  imageUrl, 
  categories, 
  author, 
  readingTime,
  canonicalUrl,
  relatedPosts = []
}: BlogPostClientProps) {
  const processedContent = processContent(post.content.rendered)
  const plainTitle = stripHtml(post.title.rendered)

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />

      <main className="pt-20">
        {/* Breadcrumb Navigation */}
        <nav className="max-w-5xl mx-auto px-4 py-4" aria-label="パンくずリスト">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" className="hover:text-foreground transition-colors" itemProp="item">
                <span itemProp="name">ホーム</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/blog" className="hover:text-foreground transition-colors" itemProp="item">
                <span itemProp="name">ブログ</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="text-foreground truncate max-w-xs">
              <span itemProp="name">{plainTitle}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="bg-card border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-500 rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="text-2xl md:text-4xl font-bold text-foreground mb-6 leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            {/* Author & Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              {author && (
                <address className="flex items-center gap-3 not-italic">
                  {author.avatar_urls?.['96'] ? (
                    <Image
                      src={author.avatar_urls['96']}
                      alt={author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                      {author.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground" rel="author">{author.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span aria-hidden="true">·</span>
                      <span>{readingTime}分で読める</span>
                    </div>
                  </div>
                </address>
              )}

              <div className="flex items-center gap-3">
                <BlogLikeButton slug={post.slug} />
                <BlogFavorite postSlug={post.slug} />
                <ShareButtons url={canonicalUrl} title={plainTitle} />
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {imageUrl && (
          <figure className="max-w-4xl mx-auto px-4 -mt-4 md:-mt-6">
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
              <Image
                src={imageUrl}
                alt={plainTitle}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
              />
            </div>
          </figure>
        )}

        {/* Article Content */}
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          <div className="flex gap-8">
            {/* Main Content */}
            <article className="flex-1 min-w-0" itemScope itemType="https://schema.org/Article">
              <div className="bg-card rounded-xl border border-border p-6 md:p-10">
                <div
                  className="article-content"
                  itemProp="articleBody"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />
              </div>

              {/* Comments Section */}
              <BlogComments postSlug={post.slug} />

              {/* Related Posts Section */}
              {relatedPosts.length > 0 && (
                <aside className="mt-8 bg-card rounded-xl border border-border p-6" aria-label="関連記事">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-foreground">他の記事もどうぞ</h3>
                    {categories[0] && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {categories[0].name}カテゴリより
                      </span>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedPosts.map((relatedPost) => {
                      const relatedImageUrl = getFeaturedImageUrl(relatedPost, 'medium')
                      const relatedCategories = relatedPost._embedded?.['wp:term']?.[0] || []
                      return (
                        <Link
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.slug}`}
                          className="group block"
                        >
                          <div className="bg-muted rounded-lg overflow-hidden hover:shadow-md transition-all border border-border hover:border-primary/30">
                            {relatedImageUrl && (
                              <div className="relative aspect-[16/9] bg-muted">
                                <Image
                                  src={relatedImageUrl}
                                  alt={stripHtml(relatedPost.title.rendered)}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="p-3">
                              {relatedCategories[0] && (
                                <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-500 rounded mb-1.5">
                                  {relatedCategories[0].name}
                                </span>
                              )}
                              <h4 
                                className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-blue-500 transition-colors"
                                dangerouslySetInnerHTML={{ __html: relatedPost.title.rendered }}
                              />
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <time>{formatDate(relatedPost.date)}</time>
                                <span>·</span>
                                <span>{getReadingTime(relatedPost.content.rendered)}分</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </aside>
              )}

              {/* Author Card */}
              {author && (
                <aside className="mt-8 bg-card rounded-xl border border-border p-6" aria-label="著者情報">
                  <div className="flex items-start gap-4">
                    {author.avatar_urls?.['96'] ? (
                      <Image
                        src={author.avatar_urls['96']}
                        alt={author.name}
                        width={64}
                        height={64}
                        className="rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {author.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-lg">{author.name}</p>
                      <p className="text-sm text-muted-foreground mb-2">tent space Inc.</p>
                      {author.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {author.description}
                        </p>
                      )}
                    </div>
                  </div>
                </aside>
              )}

              {/* Share CTA Section */}
              <aside className="mt-8 bg-card rounded-xl border border-border p-6 md:p-8" aria-label="記事をシェア">
                <h3 className="text-center font-bold text-foreground mb-6">
                  📢 記事をシェアする
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {/* Twitter/X */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(plainTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    aria-label="Xでシェア"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="text-sm font-medium">X</span>
                  </a>
                  
                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                    aria-label="Facebookでシェア"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                  
                  {/* Hatena Bookmark */}
                  <a
                    href={`https://b.hatena.ne.jp/add?mode=confirm&url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent(plainTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#00A4DE] text-white rounded-lg hover:bg-[#0095C9] transition-colors"
                    aria-label="はてなブックマークに追加"
                  >
                    <span className="font-bold text-sm">B!</span>
                    <span className="text-sm font-medium">はてブ</span>
                  </a>
                  
                  {/* LinkedIn */}
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent(plainTitle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0A66C2] text-white rounded-lg hover:bg-[#095196] transition-colors"
                    aria-label="LinkedInでシェア"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                  
                  {/* LINE */}
                  <a
                    href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(canonicalUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#06C755] text-white rounded-lg hover:bg-[#05B64D] transition-colors"
                    aria-label="LINEでシェア"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    <span className="text-sm font-medium">LINE</span>
                  </a>
                  
                  {/* Copy URL */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(canonicalUrl)
                      alert('URLをコピーしました！')
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="URLをコピー"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">URLコピー</span>
                  </button>
                </div>
              </aside>

              {/* AI Development CTA Section */}
              <aside className="mt-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 md:p-8 text-white overflow-hidden relative" aria-label="お問い合わせ">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-white/80">tent space Inc.</p>
                      <p className="font-bold text-lg">AI開発でお困りですか？</p>
                    </div>
                  </div>
                  
                  <p className="text-white/90 mb-6 leading-relaxed">
                    tent spaceでは、ChatGPT・Claude・Geminiなどの生成AIを活用した
                    <strong className="text-white">業務効率化ツール</strong>や
                    <strong className="text-white">AIチャットボット</strong>、
                    <strong className="text-white">自動化システム</strong>の開発を行っています。
                    <br />
                    <span className="text-white/80 text-sm">「こんなことできる？」というご相談だけでもお気軽にどうぞ。</span>
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="mailto:back-office@tentspace.net"
                      className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      無料で相談する
                    </a>
                    <Link
                      href="/about"
                      className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/30"
                    >
                      会社について詳しく見る
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs">ChatGPT連携</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs">業務自動化</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs">AIチャットボット</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs">LLMアプリ開発</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Back to list */}
              <nav className="mt-8 text-center" aria-label="記事一覧へ戻る">
                <Link
                  href="/blog"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  他の記事を読む
                </Link>
              </nav>
            </article>

            {/* Sidebar - Table of Contents */}
            <aside className="hidden lg:block w-64 flex-shrink-0" aria-label="サイドバー">
              <TableOfContents content={post.content.rendered} />
            </aside>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-card border-t border-border">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                  src="/logo_black_symbol.png"
                  alt="tent space"
                  width={32}
                  height={32}
                  className="opacity-60 dark:invert"
                />
                <span className="text-sm text-muted-foreground">© 2025 tent space Inc.</span>
              </div>
              <nav className="flex items-center gap-6 text-sm text-muted-foreground" aria-label="フッターナビゲーション">
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  利用規約
                </Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  プライバシー
                </Link>
                <a 
                  href="mailto:back-office@tentspace.net" 
                  className="hover:text-foreground transition-colors"
                >
                  お問い合わせ
                </a>
              </nav>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
