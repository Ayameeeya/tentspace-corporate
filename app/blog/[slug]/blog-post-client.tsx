"use client"

import { useEffect, useState, useRef, type MouseEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { FaInstagram, FaLinkedinIn, FaThreads, FaXTwitter } from "react-icons/fa6"
import { MoreHorizontal, Share } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TentBlogNav } from "@/components/home/TentBlogNav"
import { TentFooterStandalone } from "@/components/home/TentFooterStandalone"
import { MainBtn } from "@/components/home/MainBtn"
import { BlogComments } from "@/components/blog-comments"
import { BlogFavorite } from "@/components/blog-favorite"
import { formatDate, getPostTerms, stripHtml, getFeaturedImageUrl, type BlogPost, type BlogAuthor, type BlogTerm } from "@/lib/blog-content"
import { getActiveHeadingId, getTocScrollTop } from "@/lib/blog-toc"
import { addLike, fetchHasLiked, fetchLikeCounts, getClientId } from "@/lib/blog-likes"
import { createBlogShareUrls, createInstagramShareText } from "@/lib/blog-share"
import { getPlaceholderImage } from "@/lib/blog-placeholder"
import { enhanceCodeBlocks } from "@/lib/code-block-enhancement"

import 'highlight.js/styles/github-dark.css'


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
  const tocRef = useRef<HTMLElement>(null)

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
      setActiveId(grouped[0].id)
    }
  }, [content])

  useEffect(() => {
    if (sections.length === 0) return

    const headingIds = sections.flatMap((section) => [
      section.id,
      ...section.children.map((child) => child.id),
    ])
    let frameId: number | null = null

    const updateActiveHeading = () => {
      frameId = null
      const headerHeight = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--blog-nav-h'),
      ) || 128
      const headings = headingIds.flatMap((id) => {
        const element = document.getElementById(id)
        return element ? [{ id, top: element.getBoundingClientRect().top }] : []
      })
      const nextActiveId = getActiveHeadingId(headings, headerHeight + 48)
      if (nextActiveId) {
        setActiveId((currentId) => currentId === nextActiveId ? currentId : nextActiveId)
      }
    }

    const scheduleUpdate = () => {
      if (frameId === null) frameId = requestAnimationFrame(updateActiveHeading)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [sections])

  useEffect(() => {
    const toc = tocRef.current
    if (!toc || !activeId) return

    const activeLink = Array.from(toc.querySelectorAll<HTMLElement>('[data-toc-id]'))
      .find((link) => link.dataset.tocId === activeId)
    if (!activeLink) return

    const linkTop = activeLink.offsetTop
    const linkBottom = linkTop + activeLink.offsetHeight
    const visibleTop = toc.scrollTop + 48
    const visibleBottom = toc.scrollTop + toc.clientHeight - 24

    if (linkTop < visibleTop || linkBottom > visibleBottom) {
      toc.scrollTo({
        top: Math.max(0, linkTop - toc.clientHeight / 2 + activeLink.offsetHeight / 2),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    }
  }, [activeId])

  const activeSection = sections.find((section) =>
    section.id === activeId || section.children.some((child) => child.id === activeId)
  )?.id ?? sections[0]?.id ?? ''

  const handleTocClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const heading = document.getElementById(id)
    if (!heading) return

    event.preventDefault()
    const headerHeight = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--blog-nav-h'),
    ) || 128
    const top = getTocScrollTop({
      headingViewportTop: heading.getBoundingClientRect().top,
      scrollY: window.scrollY,
      headerHeight,
      gap: 24,
    })

    setActiveId(id)
    window.history.pushState(null, '', `#${id}`)
    window.scrollTo({
      top,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  if (sections.length === 0) return null

  return (
    <nav
      ref={tocRef}
      className="sticky top-[calc(var(--blog-nav-h,128px)+1rem)] max-h-[calc(100dvh-var(--blog-nav-h,128px)-2rem)] overflow-x-hidden overflow-y-auto overscroll-contain scroll-smooth pl-4 py-1 motion-reduce:scroll-auto"
      style={{ borderLeft: "1px solid var(--m-ink, #000)" }}
      aria-label="目次"
    >
      <h3 className="mb-3 flex items-baseline gap-2 text-sm font-bold text-foreground">
        目次
        <span className="text-xs font-normal" style={{ opacity: 0.45 }}>
          contents
        </span>
      </h3>
      <ul className="space-y-1">
        {sections.map((section) => {
          const isOpen = activeSection === section.id
          const isActive = activeId === section.id

          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                data-toc-id={section.id}
                aria-current={isActive ? 'location' : undefined}
                onClick={(event) => handleTocClick(event, section.id)}
                className={`flex items-center gap-1 py-1.5 text-sm transition-colors duration-200 ${isActive ? 'font-bold text-[#0f00b0]' : 'text-muted-foreground hover:text-foreground'
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
                        data-toc-id={child.id}
                        aria-current={activeId === child.id ? 'location' : undefined}
                        onClick={(event) => handleTocClick(event, child.id)}
                        className={`block py-1 pl-7 text-xs transition-colors duration-200 ${activeId === child.id ? 'font-bold text-[#0f00b0]' : 'text-muted-foreground hover:text-foreground'
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

// ---- シェア導線 ------------------------------------------------------------
// 共有先はここで一元管理し、ヘッダーのメニューと記事末尾の行の両方で使う

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}

function CopyLinkIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  )
}

interface ShareTarget {
  key: string
  label: string
  text: string
  href?: string
  onClick?: () => void
  icon: React.ReactNode
}

// 前半は SNS を需要順に、末尾に投稿先を選ばない操作（URLコピー・OS の共有シート）を置く。
// X が主戦場、はてブは技術記事の流入装置、Threads は自社の運用チャネル
function buildShareTargets(url: string, title: string, includeNative = false): ShareTarget[] {
  const shareUrls = createBlogShareUrls({ url, title })
  const targets: ShareTarget[] = [
    { key: "x", label: "Xでシェア", text: "X", href: shareUrls.x, icon: <FaXTwitter aria-hidden="true" /> },
    {
      key: "hatena",
      label: "はてなブックマークに追加",
      text: "はてブ",
      href: `https://b.hatena.ne.jp/add?mode=confirm&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      icon: <span className="text-xs font-bold" aria-hidden="true">B!</span>,
    },
    { key: "threads", label: "Threadsでシェア", text: "Threads", href: shareUrls.threads, icon: <FaThreads aria-hidden="true" /> },
    {
      key: "line",
      label: "LINEでシェア",
      text: "LINE",
      href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
      icon: <LineIcon />,
    },
    { key: "linkedin", label: "LinkedInでシェア", text: "LinkedIn", href: shareUrls.linkedin, icon: <FaLinkedinIn aria-hidden="true" /> },
    {
      key: "facebook",
      label: "Facebookでシェア",
      text: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: <FacebookIcon />,
    },
    {
      key: "instagram",
      label: "Instagramでシェア",
      text: "Instagram",
      href: shareUrls.instagram,
      onClick: () => {
        navigator.clipboard.writeText(createInstagramShareText({ url, title }))
        alert("Instagram投稿用のタイトルとURLをコピーしました")
      },
      icon: <FaInstagram aria-hidden="true" />,
    },
    {
      key: "copy",
      label: "URLをコピー",
      text: "URLをコピー",
      onClick: () => {
        navigator.clipboard.writeText(url)
        alert("URLをコピーしました！")
      },
      icon: <CopyLinkIcon />,
    },
  ]

  // OS の共有シート。対応環境（主にモバイル）でだけ末尾に出す
  if (includeNative) {
    targets.push({
      key: "native",
      label: "端末の共有メニューで共有",
      text: "その他",
      onClick: () => {
        navigator.share({ title, url }).catch(() => {
          // キャンセル時は何もしない
        })
      },
      icon: <MoreHorizontal strokeWidth={1.5} aria-hidden="true" />,
    })
  }

  return targets
}

// note 風のシェアメニュー: アイコン 1 個からドロップダウンを開く
function ShareMenu({ targets }: { targets: ShareTarget[] }) {
  const itemClass =
    "cursor-crosshair gap-2.5 rounded-none px-3.5 py-2.5 text-[13px] focus:bg-black focus:text-white [&_svg]:w-4 [&_svg]:h-4"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="tent-ghost-btn" title="シェア" aria-label="記事をシェア">
          <Share strokeWidth={1.5} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-none border-black bg-white p-0 shadow-none">
        {targets.map((target) =>
          target.href ? (
            <DropdownMenuItem key={target.key} asChild className={itemClass}>
              <a
                href={target.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={target.label}
                onClick={target.onClick}
              >
                {target.icon}
                {target.text}
              </a>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={target.key} className={itemClass} aria-label={target.label} onSelect={target.onClick}>
              {target.icon}
              {target.text}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
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
        if (clientId != null) {
          const liked = await fetchHasLiked(slug, clientId)
          setHasLiked(liked)
        }
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
        className="tent-ghost-btn"
        data-active={hasLiked}
        aria-pressed={hasLiked}
        title={hasLiked ? 'いいね済み' : 'いいね'}
        aria-label={hasLiked ? 'いいね済み' : 'いいね'}
      >
        <svg viewBox="0 0 24 24" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.75-4.35-6.75-9.75A4.25 4.25 0 0112 7.25a4.25 4.25 0 016.75 4c0 5.4-6.75 9.75-6.75 9.75z" />
        </svg>
        <span>{count ?? '–'}</span>
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


// Code Block Enhancement Component
function useCodeBlockEnhancement(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    void enhanceCodeBlocks(container, undefined, () => cancelled).catch((error) => {
      console.warn("Code block enhancement failed", error)
    })

    return () => {
      cancelled = true
    }
  }, [containerRef])
}


// Props type
interface BlogPostClientProps {
  post: BlogPost
  contentHtml: string
  imageUrl: string | null
  categories: BlogTerm[]
  author: BlogAuthor | undefined
  readingTime: number
  canonicalUrl: string
  relatedPosts?: BlogPost[]
}

// Main Blog Post Client Component
export default function BlogPostClient({
  post,
  contentHtml,
  imageUrl, 
  categories, 
  author, 
  readingTime,
  canonicalUrl,
  relatedPosts = []
}: BlogPostClientProps) {
  const processedContent = processContent(contentHtml)
  const plainTitle = stripHtml(post.title)
  // navigator.share は SSR に存在しないため、マウント後に判定する
  const [canNativeShare, setCanNativeShare] = useState(false)
  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function")
  }, [])
  const shareTargets = buildShareTargets(canonicalUrl, plainTitle, canNativeShare)
  const articleRef = useRef<HTMLDivElement>(null)
  
  // Enhance code blocks after content is rendered
  useCodeBlockEnhancement(articleRef)

  return (
    <div className="tent-page min-h-screen" style={{ background: "#ffffff" }}>
      <TentBlogNav />

      <main id="main-content" className="pt-[calc(var(--blog-nav-h,128px)+1.5rem)]">
        {/* Breadcrumb Navigation */}
        <nav className="max-w-3xl mx-auto px-4 py-5" aria-label="パンくずリスト">
          <ol className="flex items-center gap-3 text-xs" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" prefetch={false} className="tent-ul" style={{ opacity: 0.55 }} itemProp="item">
                <span itemProp="name">home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li aria-hidden="true" style={{ opacity: 0.35 }}>
              /
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/blog" className="tent-ul" style={{ opacity: 0.55 }} itemProp="item">
                <span itemProp="name">blog</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li aria-hidden="true" style={{ opacity: 0.35 }}>
              /
            </li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="truncate max-w-xs">
              <span itemProp="name">{plainTitle}</span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header style={{ borderBottom: "1px solid var(--m-ink)" }}>
          <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="tent-works__tags mb-5">
                {categories.map((cat) => (
                  <span key={cat.id} className="tent-works__tag">
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="article-title text-2xl md:text-4xl font-bold text-foreground mb-6"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />

            {/* Author & Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              {author && (
                <address className="flex items-center gap-3 not-italic">
                  {author.avatarUrl ? (
                    <Image
                      src={author.avatarUrl}
                      alt={author.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0f00b0] flex items-center justify-center text-white font-medium">
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

              <div className="flex flex-wrap items-center justify-end gap-4">
                <BlogLikeButton slug={post.slug} />
                <BlogFavorite postSlug={post.slug} />
                <ShareMenu targets={shareTargets} />
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {imageUrl && (
          <figure className="max-w-4xl mx-auto px-4 mt-8 md:mt-10">
            <div className="relative aspect-[16/9] overflow-hidden" style={{ border: "1px solid var(--m-ink)" }}>
              <Image
                src={imageUrl}
                alt={plainTitle}
                fill
                className="object-cover"
                priority
                fetchPriority="high"
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
              <div className="py-2 md:py-4">
                <div
                  ref={articleRef}
                  className="article-content"
                  itemProp="articleBody"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />
              </div>

              {/* Comments Section */}
              <BlogComments postSlug={post.slug} />

              {/* Related Posts Section */}
              {relatedPosts.length > 0 && (
                <aside className="mt-12 pt-6" style={{ borderTop: "1px solid var(--m-ink)" }} aria-label="関連記事">
                  <div className="flex items-baseline gap-3 mb-6 flex-wrap">
                    <h3 className="font-bold text-foreground">他の記事もどうぞ</h3>
                    <span className="text-xs text-muted-foreground">related</span>
                    {categories[0] && (
                      <span className="tent-works__tag" style={{ fontSize: "0.7rem" }}>
                        {categories[0].name}
                      </span>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {relatedPosts.map((relatedPost) => {
                      const relatedImageUrl = getFeaturedImageUrl(relatedPost)
                      const relatedCategories = getPostTerms(relatedPost)
                      return (
                        <Link
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.slug}`}
                          className="group block"
                        >
                          <div className="bg-muted rounded-lg overflow-hidden hover:shadow-md transition-all border border-border hover:border-primary/30">
                            <div className="relative aspect-[16/9] bg-muted">
                              <Image
                                src={relatedImageUrl ?? getPlaceholderImage(relatedPost.id)}
                                alt={stripHtml(relatedPost.title)}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-3">
                              {relatedCategories[0] && (
                                <span className="inline-block px-2 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded mb-1.5">
                                  {relatedCategories[0].name}
                                </span>
                              )}
                              <h4 
                                className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
                                dangerouslySetInnerHTML={{ __html: relatedPost.title }}
                              />
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <time>{formatDate(relatedPost.date)}</time>
                                <span>·</span>
                                <span>{relatedPost.readingTime}分</span>
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
                <aside className="mt-8 p-6" style={{ border: "1px solid var(--m-ink)" }} aria-label="著者情報">
                  <div className="flex items-start gap-4">
                    {author.avatarUrl ? (
                      <Image
                        src={author.avatarUrl}
                        alt={author.name}
                        width={64}
                        height={64}
                        className="rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#0f00b0] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
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

              {/* Share Section — note 風の細いアイコン行 */}
              <aside className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="記事をシェア">
                <span className="mr-3 text-[11px] tracking-widest" style={{ opacity: 0.45 }}>
                  share
                </span>
                {shareTargets.map((target) =>
                  target.href ? (
                    <a
                      key={target.key}
                      href={target.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tent-ghost-btn"
                      title={target.text}
                      aria-label={target.label}
                      onClick={target.onClick}
                    >
                      {target.icon}
                    </a>
                  ) : (
                    <button
                      key={target.key}
                      type="button"
                      className="tent-ghost-btn"
                      title={target.text}
                      aria-label={target.label}
                      onClick={target.onClick}
                    >
                      {target.icon}
                    </button>
                  ),
                )}
              </aside>

              {/* AI Development CTA Section */}
              <aside className="mt-8 p-6 md:p-8" style={{ background: "var(--m-indigo)", color: "#e5e5e5" }} aria-label="お問い合わせ">
                <div>
                  <div className="mb-4">
                    <p className="text-sm" style={{ opacity: 0.7 }}>with tent space</p>
                    <p className="font-bold text-lg">AI開発、お手伝いできます。</p>
                  </div>

                  <p className="mb-6 leading-relaxed" style={{ opacity: 0.9 }}>
                    tent spaceでは、ChatGPT・Claude・Geminiなどの生成AIを活用した
                    業務効率化ツールやAIチャットボット、自動化システムの開発を行っています。
                    <br />
                    <span className="text-sm" style={{ opacity: 0.8 }}>「こんなことできる？」というご相談だけでもお気軽にどうぞ。</span>
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center px-6 py-3 font-bold transition-colors"
                      style={{ background: "#e5e5e5", color: "#0f00b0" }}
                    >
                      無料で相談する
                    </Link>
                    <Link
                      href="/about"
                      prefetch={false}
                      className="inline-flex items-center justify-center px-6 py-3 font-medium transition-colors"
                      style={{ border: "1px solid rgba(229,229,229,0.5)", color: "#e5e5e5" }}
                    >
                      会社について詳しく見る
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  
                  <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(229,229,229,0.3)" }}>
                    <div className="flex flex-wrap gap-2">
                      {["ChatGPT連携", "業務自動化", "AIチャットボット", "LLMアプリ開発"].map((t) => (
                        <span key={t} className="px-3 py-1 text-xs" style={{ border: "1px solid rgba(229,229,229,0.5)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Back to list */}
              <nav className="mt-10 flex justify-center" aria-label="記事一覧へ戻る">
                <MainBtn label="他の記事を読む" href="/blog" variant="inside" />
              </nav>
            </article>

            {/* Sidebar - Table of Contents */}
            <aside className="hidden md:block w-64 flex-shrink-0" aria-label="サイドバー">
              <TableOfContents content={contentHtml} />
            </aside>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16">
          <TentFooterStandalone />
        </div>
      </main>
    </div>
  )
}
