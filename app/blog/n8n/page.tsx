import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"
import { Footer } from "@/components/footer"
import { FloatingContactButton } from "@/components/floating-contact-button"
import {
  getPosts,
  getCategoryBySlug,
  getFeaturedImageUrl,
  stripHtml,
  formatDate,
  getReadingTime,
  type WPPost,
} from "@/lib/wordpress"

const SITE_URL = "https://tentspace.net"

// Enable dynamic rendering
export const dynamic = "force-dynamic"

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const category = await getCategoryBySlug("n8n")

  if (!category) {
    return {
      title: "カテゴリが見つかりません",
    }
  }

  const description = `${category.name}に関する記事一覧です。tent spaceのエンジニアが${category.name}について実践的な技術情報をお届けします。`

  return {
    title: `${category.name}完全ガイド | 記事一覧`,
    description,
    openGraph: {
      title: `${category.name}完全ガイド | tent space Blog`,
      description,
      url: `${SITE_URL}/blog/n8n`,
      siteName: "tent space Blog",
      locale: "ja_JP",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/logo_gradation_yoko.png`,
          width: 1200,
          height: 630,
          alt: `${category.name}完全ガイド`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name}完全ガイド | tent space Blog`,
      description,
      images: [`${SITE_URL}/logo_gradation_yoko.png`],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/n8n`,
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

// Blog Card Component
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
            <div className="relative aspect-[16/9] bg-slate-100 dark:bg-gray-800 overflow-hidden mb-5 rounded-lg">
              <Image
                src={imageUrl}
                alt={stripHtml(post.title.rendered)}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Category */}
            <div className="flex items-center gap-2 mb-3">
              {categories[0] && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {categories[0].name}
                </span>
              )}
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
              <span>{readingTime}分で読める</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// 章の定義
const chapters = [
  {
    id: 1,
    title: "第1章：n8nの基礎知識",
    description: "n8nを使い始める前に、まずは基本的な概念を理解しましょう。n8nとは何か、どのような特徴があるのか、なぜ注目されているのかを解説します。プログラミング未経験の方でも、この章を読めばn8nの全体像を把握できます。",
    keywords: ["n8nとは", "読み方", "ノーコード"],
    articles: 2,
  },
  {
    id: 2,
    title: "第2章：n8nの導入・セットアップ",
    description: "n8nを実際に使い始めるための環境構築方法を解説します。手軽に試せるローカル環境から、Docker Composeを使った本格的なセルフホスト環境、VPSでの本番運用まで、目的に応じた導入方法を学べます。",
    keywords: ["Docker", "インストール", "ローカル", "Compose", "セルフホスト", "VPS", "PostgreSQL"],
    articles: 7,
  },
  {
    id: 3,
    title: "第3章：n8nの使い方",
    description: "n8nの基本的な操作方法を学びます。ワークフローの作成方法、ノードの設定、Webhookの活用、公式テンプレートの使い方など、実際に手を動かしながら習得できるチュートリアル形式で解説します。",
    keywords: ["使い方", "初心者", "始め方", "Webhook", "テンプレート"],
    articles: 4,
  },
  {
    id: 4,
    title: "第4章：AI・LLM連携",
    description: "n8nの最大の強みの一つが、OpenAI、ChatGPT、Claude、LangChainなどのAI/LLMとの連携です。単なるAPI呼び出しだけでなく、RAG（検索拡張生成）や自律的に判断して行動する「AIエージェント」の構築方法まで、最先端のAI自動化を学べます。",
    keywords: ["OpenAI", "ChatGPT", "Claude", "AIエージェント", "LangChain", "RAG", "MCP"],
    articles: 7,
  },
  {
    id: 5,
    title: "第5章：他ツールとの比較",
    description: "業務自動化ツールは、n8n以外にもZapier、Makeなど複数の選択肢があります。それぞれの特徴、料金体系、得意分野を比較し、自分に最適なツールを選ぶための情報を提供します。",
    keywords: ["Zapier", "Make", "vs"],
    articles: 2,
  },
  {
    id: 6,
    title: "第6章：料金・ライセンス",
    description: "n8nの料金体系、無料で使える範囲、商用利用時の注意点について解説します。セルフホスト版とクラウド版の違い、フェアコードライセンスの詳細、コストを最適化する方法を理解し、安心してn8nを導入できます。",
    keywords: ["料金", "プラン", "無料", "コスト", "フェアコード", "ライセンス"],
    articles: 3,
  },
  {
    id: 7,
    title: "第7章：活用事例・ワークフローレシピ",
    description: "n8nで実現できる具体的な自動化事例を紹介します。Gmail自動返信、Slack通知、Google Sheets連携、WordPress連携など、すぐに使える実践的なワークフローレシピを掲載。営業、マーケティング、カスタマーサポート、経理、開発など、部門別のユースケースも学べます。",
    keywords: ["ワークフロー", "活用事例", "Gmail", "Slack", "Google Sheets", "WordPress", "自動化"],
    articles: 6,
  },
]

// 記事を章ごとに分類
function categorizePostsByChapter(posts: WPPost[]) {
  const postsByChapter = new Map<number, WPPost[]>()

  posts.forEach((post) => {
    const title = stripHtml(post.title.rendered).toLowerCase()

    // 各章のキーワードにマッチするか確認
    for (const chapter of chapters) {
      const matchesKeyword = chapter.keywords.some((keyword) =>
        title.includes(keyword.toLowerCase())
      )

      if (matchesKeyword) {
        const chapterPosts = postsByChapter.get(chapter.id) || []
        chapterPosts.push(post)
        postsByChapter.set(chapter.id, chapterPosts)
        break // 最初にマッチした章に分類
      }
    }
  })

  return postsByChapter
}

// Server Component
export default async function N8nFeaturedPage() {
  const category = await getCategoryBySlug("n8n")

  if (!category) {
    notFound()
  }

  // n8nカテゴリの全記事を取得（100件まで）
  const { posts, total } = await getPosts({
    categories: [category.id],
    perPage: 100,
  })

  // 記事を章ごとに分類
  const postsByChapter = categorizePostsByChapter(posts)

  // JSON-LD for Category Page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name}完全ガイド`,
    description: `${category.name}に関する記事一覧です。`,
    url: `${SITE_URL}/blog/n8n`,
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
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-none mb-6">
                  {category.name}完全ガイド
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-gray-300 mb-6">
                  {category.name}に関する記事を全7章に体系化。基礎知識から導入・セットアップ、AI連携、実践的な活用事例まで、{category.name}のすべてを網羅的に学べます。
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    全7章・{total}記事
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16 border-b border-slate-200 dark:border-gray-800">
            <div className="max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                このガイドの使い方
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg text-slate-600 dark:text-gray-300 mb-6">
                  n8n完全ガイドは、業務自動化ツール「n8n」を基礎から実践まで体系的に学べる学習ロードマップです。
                  初心者の方は第1章から順番に、すでに基本を理解している方は必要な章から読み進めてください。
                </p>

                {/* 目次 */}
                <div className="bg-slate-50 dark:bg-gray-900 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    全7章の構成
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {chapters.map((chapter) => (
                      <a
                        key={chapter.id}
                        href={`#chapter-${chapter.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold group-hover:scale-110 transition-transform">
                          {chapter.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-foreground group-hover:text-blue-500 transition-colors truncate">
                            {chapter.title.replace(/^第\d+章：/, '')}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-gray-500">
                            {chapter.articles}記事
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-6 mb-8">
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    おすすめの学習順序
                  </h3>
                  <ol className="space-y-2 text-slate-700 dark:text-gray-300">
                    <li><strong>初めての方:</strong> 第1章 → 第2章 → 第3章の順に読み進めることで、n8nの基礎をしっかり習得できます</li>
                    <li><strong>AI連携に興味がある方:</strong> 第1〜3章で基礎を学んだ後、第4章でAI/LLM連携の方法を学びましょう</li>
                    <li><strong>ツール選定中の方:</strong> 第1章と第5章で、n8nが自分に適しているか判断できます</li>
                    <li><strong>実践重視の方:</strong> 第7章の活用事例から始めて、必要に応じて技術的な章を参照するのもおすすめです</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-600 dark:text-gray-300 mb-4">記事がまだありません</p>
              </div>
            ) : (
              <div className="space-y-20 md:space-y-24">
                {chapters.map((chapter) => {
                  const chapterPosts = postsByChapter.get(chapter.id) || []

                  if (chapterPosts.length === 0) return null

                  return (
                    <section key={chapter.id} id={`chapter-${chapter.id}`} className="space-y-8 scroll-mt-20">
                      {/* Chapter Header */}
                      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-2xl p-8 md:p-10 border border-slate-200 dark:border-gray-800">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                            {chapter.id}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                              {chapter.title}
                            </h2>
                            <p className="text-base md:text-lg text-slate-600 dark:text-gray-400 leading-relaxed mb-4">
                              {chapter.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="inline-flex items-center gap-2 text-slate-500 dark:text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {chapterPosts.length}記事
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Chapter Posts Grid */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
                        {chapterPosts.map((post) => (
                          <BlogCard key={post.id} post={post} />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-24 md:mt-32">
            <Footer />
          </div>
        </main>

        {/* Floating Contact Button */}
        <FloatingContactButton />
      </div>
    </>
  )
}

