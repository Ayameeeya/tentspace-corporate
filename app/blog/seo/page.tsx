import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"
import { Footer } from "@/components/footer"
import {
  getPosts,
  getCategoryBySlug,
  getFeaturedImageUrl,
  stripHtml,
  formatDate,
  type BlogPost,
} from "@/lib/blog-content"
import { SITE_URL } from "@/lib/site"

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const category = await getCategoryBySlug("seo")

  const description = category?.description || "SEOに関する記事一覧です。tent spaceのエンジニアがSEOについて実践的な技術情報をお届けします。"

  return {
    title: "SEO特設サイト | tent space Blog",
    description,
    openGraph: {
      title: "SEO特設サイト | tent space Blog",
      description,
      url: `${SITE_URL}/blog/seo`,
      siteName: "tent space Blog",
      locale: "ja_JP",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/logo_gradation_yoko.png`,
          width: 1200,
          height: 630,
          alt: "SEO特設サイト",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "SEO特設サイト | tent space Blog",
      description,
      images: [`${SITE_URL}/logo_gradation_yoko.png`],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/seo`,
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

// Blog Card Component (Smaller compact version)
function BlogCard({ post }: { post: BlogPost }) {
  const imageUrl = getFeaturedImageUrl(post)
  const excerpt = stripHtml(post.description)

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="flex gap-4">
          {/* Image */}
          {imageUrl && (
            <div className="relative w-24 h-24 flex-shrink-0 bg-muted overflow-hidden">
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4
              className="text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />
            <p className="text-sm text-muted-foreground">
              {formatDate(post.date)}
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}

// Large Blog Card Component (for article list)
function LargeBlogCard({ post }: { post: BlogPost }) {
  const imageUrl = getFeaturedImageUrl(post)
  const excerpt = stripHtml(post.description)
  const readingTime = post.readingTime

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="h-full flex flex-col">
          {/* Image */}
          {imageUrl && (
            <div className="relative aspect-[16/9] bg-muted overflow-hidden mb-4">
              <Image
                src={imageUrl}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex flex-col">
            {/* Title */}
            <h3
              className="text-lg md:text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title }}
            />

            {/* Excerpt */}
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3 leading-relaxed flex-1">
              {excerpt}
            </p>

            {/* Meta Footer */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border">
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

// Chapter Section Component
function ChapterSection({
  chapterNumber,
  title,
  description,
  posts,
}: {
  chapterNumber: number
  title: string
  description: string
  posts: BlogPost[]
}) {
  return (
    <section id={`chapter-${chapterNumber}`} className="mb-16 md:mb-24">
      <div className="mb-8">
        <p className="text-sm font-bold text-primary mb-2">
          第{chapterNumber}章
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {title}
        </h2>
        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          {description}
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          この章の記事は準備中です
        </p>
      )}
    </section>
  )
}

// Main SEO Special Page
export default async function SEOPage() {
  try {
    // SEOカテゴリを取得
    const category = await getCategoryBySlug("seo")
    
    if (!category) {
      return (
        <div className="min-h-screen bg-background">
          <BlogHeader />
          <main className="pt-[104px] md:pt-[120px]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-16">
              <h1 className="text-4xl font-bold mb-4">カテゴリが見つかりません</h1>
              <p className="text-muted-foreground mb-6">
                SEOカテゴリが存在しません。
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-2.5 border border-foreground text-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-all"
              >
                ブログトップへ
              </Link>
            </div>
          </main>
        </div>
      )
    }

    // SEOカテゴリの全記事を取得（ページネーション無し、最大100件）
    const { posts, total } = await getPosts({
      categories: [category.id],
      perPage: 100,
    })

    // タイトルのキーワードで章ごとに分類
    const getPostsByKeywords = (keywords: string[]) => {
      return posts.filter(post => {
        const decodedSlug = decodeURIComponent(post.slug).toLowerCase()
        const title = post.title.toLowerCase()
        return keywords.some(keyword => 
          decodedSlug.includes(keyword.toLowerCase()) || 
          title.includes(keyword.toLowerCase())
        )
      })
    }

    // 章ごとのキーワード定義（実際のスラッグから抽出）
    const chapter1Keywords = [
      '検索エンジンの仕組み',
      'クローリング',
      'ドメインパワー',
      'アルゴリズム',
      'ペンギンアップデート',
      'パンダアップデート',
      'google検索の基本事項',
      'ウェブマスター',
      '検索品質評価ガイドライン',
      'e-e-a-t',
      '権威性',
    ]

    const chapter2Keywords = [
      'キーワード選定',
      'キーワードプランナー',
      'ロングテールseo',
      '関連キーワード',
      '検索クエリ',
    ]

    const chapter3Keywords = [
      'コンテンツ',
      'クローキング',
      'キーワード出現率',
      'titleタグ',
      'hタグ',
      '見出しタグ',
      'タイトルタグ',
      'h1タグ',
      'meta description',
      'メタディスクリプション',
      '重複コンテンツ',
    ]

    const chapter4Keywords = [
      'alt属性',
      'canonical',
      'htmlサイトマップ',
      'xmlサイトマップ',
      'urlの正規化',
      'サブディレクトリ',
      'パーマリンク',
      'パンくずリスト',
      'ページ速度',
      '構造化データ',
      '内部リンク',
      'アンカーテキスト',
      'クロールバジェット',
      'セマンティック検索',
      '404エラー',
    ]

    const chapter5Keywords = [
      '被リンク',
      'ページランク',
      'リンクジュース',
      '外部リンク',
    ]

    const chapter6Keywords = [
      'ahrefs',
      'googleアナリティクス',
      'ga4',
      'サーチコンソール',
      'search console',
      'seo効果測定',
    ]

    // 章の定義
    const chapters = [
      {
        number: 1,
        title: "検索アルゴリズムとは",
        description: "SEOは検索エンジンで上位表示させるための一連の施策のことですが、そもそも検索エンジン（主にGoogle）はどのようにサイトの掲載順位を決定しているのでしょうか。検索エンジンの仕組みやアルゴリズムについて詳しく解説します。",
        posts: getPostsByKeywords(chapter1Keywords),
      },
      {
        number: 2,
        title: "キーワード選定",
        description: "検索エンジンで上位表示を目指すためのSEO対策の第一歩は狙うべき検索キーワードのリサーチ、つまりキーワード選定から始まります。徹底的にキーワードリサーチを行うことで、「どれだけの需要があるのか」「どのようなコンテンツを作るべきか」が明確になります。",
        posts: getPostsByKeywords(chapter2Keywords),
      },
      {
        number: 3,
        title: "オンページSEO",
        description: "オンページSEOというのはページ上のコンテンツとHTMLソースの最適化を行うSEO対策のことです。コンテンツの制作と各タグの最適化について詳しく解説します。コンテンツ制作は最も重要なSEO施策と位置付けられています。",
        posts: getPostsByKeywords(chapter3Keywords),
      },
      {
        number: 4,
        title: "テクニカルSEO",
        description: "テクニカルSEOというのはサイト構造における技術的要件を検索エンジンに最適化させることです。Googleのクローラーが認識しやすいサイト構造にすることで、自身のサイトを正しく評価してもらいやすくなります。",
        posts: getPostsByKeywords(chapter4Keywords),
      },
      {
        number: 5,
        title: "被リンク獲得",
        description: "SEOを考えるうえでコンテンツの次に重要なのが被リンクです。被リンクとは「別のWebページからされたリンク」のことで、被リンクが多いほど、他ページで言及あるいは紹介されていると判断されます。",
        posts: getPostsByKeywords(chapter5Keywords),
      },
      {
        number: 6,
        title: "SEOの効果測定",
        description: "SEOを進めるうえでは、ただ施策を実施し続けるだけでなく適切な効果測定を行うことが重要になります。Google AnalyticsやSearch Consoleなどのツールを活用した分析方法について解説します。",
        posts: getPostsByKeywords(chapter6Keywords),
      },
    ]

    // JSON-LD for SEO Page
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "SEO特設サイト",
      description: category.description || "SEOに関する記事一覧です。",
      url: `${SITE_URL}/blog/seo`,
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

        <div className="min-h-screen bg-background">
          <BlogHeader />

          {/* Subtle gradient background */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-500/3 blur-3xl" />
          </div>

          {/* Main Content */}
          <main className="pt-16 md:pt-20 relative z-10">
            {/* Hero Section */}
            <div className="border-b border-border">
              <div className="max-w-[1000px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
                <div className="text-sm text-primary font-bold mb-4 uppercase tracking-wider">
                  CONTENT SEO
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-none mb-6">
                  SEO初心者向けマニュアル
                </h1>
                
                <div className="prose prose-slate max-w-none mb-8">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    SEOとは、「Search Engine Optimization」（検索エンジン最適化）という意味で、今の日本においては主にGoogleの検索エンジンで上位に表示されるための一連の施策のことです。わかりやすくいえば「自社サイトを1位に表示させるための対策」とも言えます。
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    このページでは、よりビジネスを成長させたい方にSEOを攻略するために必要な具体的な知識とスキルを解説しています。
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    真剣に取り組んでもらえれば、どのような業種の方でも今までをはるかに上回る流入と、コンバージョンを実現することができるようになるでしょう。
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-8">
                  最終更新日 {new Date().toLocaleDateString('ja-JP')} / {total} 件の記事
                </p>
              </div>
            </div>

            {/* AI時代のSEO - 比較記事セクション */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-y border-primary/20">
              <div className="max-w-[1000px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
                <div className="mb-6">
                  <div className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-bold mb-4">
                    🤖 AI時代の新常識
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    AI時代でもブログを書くべき理由
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    ChatGPTやGeminiなどのAIツールが普及する中、「もうブログやSEOは終わりでは？」という声も聞かれます。
                    しかし、AI時代だからこそ、より一層SEOとコンテンツマーケティングの重要性が高まっています。
                    従来のSEO対策に加えて、AI時代特有の新しい視点と戦略が必要です。
                  </p>
                </div>

                {/* 旧SEO vs AI時代のSEO 比較表 */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-background p-6 border-2 border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                      <h3 className="text-lg font-bold text-muted-foreground">従来のSEO</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        <span>キーワード詰め込み重視</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        <span>被リンク数がすべて</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        <span>検索エンジン最適化のみ</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        <span>テクニック重視の施策</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 border-2 border-blue-500 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                      <h3 className="text-lg font-bold text-white">AI時代のSEO</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-white">
                      <li className="flex items-start gap-2">
                        <span className="mt-1">✓</span>
                        <span>ユーザー体験と価値提供</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1">✓</span>
                        <span>E-E-A-T（専門性・権威性）</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1">✓</span>
                        <span>AIツールとの共存戦略</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1">✓</span>
                        <span>本質的なコンテンツ品質</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 関連記事 */}
                {posts.find(post => decodeURIComponent(post.slug).includes('cloudflare-pay-per-crawl') || decodeURIComponent(post.slug).includes('ai')) && (
                  <div className="bg-background p-6 border border-primary/30">
                    <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">
                      📖 詳しく読む
                    </h4>
                    {posts
                      .filter(post => 
                        decodeURIComponent(post.slug).includes('cloudflare-pay-per-crawl') || 
                        decodeURIComponent(post.slug).includes('ai時代')
                      )
                      .slice(0, 1)
                      .map(post => {
                        const imageUrl = getFeaturedImageUrl(post)
                        return (
                          <Link 
                            key={post.id} 
                            href={`/blog/${post.slug}`}
                            className="flex gap-4 group"
                          >
                            {imageUrl && (
                              <div className="relative w-32 h-32 flex-shrink-0 bg-muted overflow-hidden">
                                <Image
                                  src={imageUrl}
                                  alt={post.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 
                                className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors"
                                dangerouslySetInnerHTML={{ __html: post.title }}
                              />
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {stripHtml(post.description)}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Chapter Navigation */}
            <div className="bg-muted/50 border-b border-border">
              <div className="max-w-[1000px] mx-auto px-6 md:px-12 lg:px-16 py-8">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  CONTENT コンテンツ
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  従来のSEO対策の基礎から応用まで、6つの章で体系的に解説します
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {chapters.map((chapter) => (
                    <Link
                      key={chapter.number}
                      href={`#chapter-${chapter.number}`}
                      className="group block p-6 bg-background border border-border hover:border-primary transition-all"
                    >
                      <p className="text-sm text-muted-foreground mb-2">
                        第{chapter.number}章
                      </p>
                      <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {chapter.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Chapters Content */}
            <div className="max-w-[1000px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20">
              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground mb-4">まだSEO関連の記事がありません</p>
                  <Link
                    href="/blog"
                    className="inline-flex items-center px-6 py-2.5 border border-foreground text-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-all"
                  >
                    ブログ一覧を見る
                  </Link>
                </div>
              ) : (
                <>
                  {chapters.map((chapter) => (
                    <ChapterSection
                      key={chapter.number}
                      chapterNumber={chapter.number}
                      title={chapter.title}
                      description={chapter.description}
                      posts={chapter.posts}
                    />
                  ))}
                </>
              )}
            </div>

            {/* All Articles Section */}
            {posts.length > 0 && (
              <div className="bg-muted/50 py-12 md:py-20">
                <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-16">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                    SEOの記事一覧
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                      <LargeBlogCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-24 md:mt-32">
              <Footer />
            </div>
          </main>
        </div>
      </>
    )
  } catch (error) {
    console.error("Error loading SEO page:", error)
    
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="pt-16 md:pt-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-16">
            <h1 className="text-4xl font-bold mb-4">エラーが発生しました</h1>
            <p className="text-muted-foreground mb-6">
              ページの読み込み中にエラーが発生しました。しばらくしてから再度お試しください。
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-2.5 border border-foreground text-foreground text-sm font-bold hover:bg-foreground hover:text-background transition-all"
            >
              ブログトップへ
            </Link>
          </div>
        </main>
      </div>
    )
  }
}
