import { Metadata } from "next"
import { TentBlogNav } from "@/components/home/TentBlogNav"
import { TentFooterStandalone } from "@/components/home/TentFooterStandalone"
import { FloatingContactButton } from "@/components/floating-contact-button"
import { ChapterLabel } from "@/components/home/ChapterText"
import { ScrambleText } from "@/components/home/ScrambleText"
import { HeroVisual } from "@/components/home/HeroVisual"
import { MainBtn } from "@/components/home/MainBtn"
import { ShutterScroll } from "@/components/home/ShutterScroll"
import { BlogPostCard } from "@/components/blog-post-card"
import {
  getPosts,
  getCategoryBySlug,
  type BlogPost,
} from "@/lib/blog-content"
import { SITE_URL } from "@/lib/site"

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const category = await getCategoryBySlug("seo")

  const description = category?.description || "SEOに関する記事一覧です。tent spaceのエンジニアがSEOについて実践的な技術情報をお届けします。"

  return {
    title: "SEO特設サイト",
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

const ROUTES = [
  ["初めての方", "01 → 02 → 03 の順で、仕組みから施策へ"],
  ["記事・コンテンツ担当の方", "02でキーワードを掴み、03で書き方を最適化"],
  ["エンジニアの方", "04のテクニカルSEOから。構造で評価を底上げ"],
  ["運用中のサイトを改善したい方", "06で現状を測り、必要な章へ戻る"],
]

// Main SEO Special Page
export default async function SEOPage() {
  try {
    // SEOカテゴリを取得
    const category = await getCategoryBySlug("seo")

    if (!category) {
      return (
        <div className="tent-page" style={{ background: "#ffffff" }}>
          <TentBlogNav />
          <main id="main-content" className="tent-doc">
            <div className="tent-container">
              <ChapterLabel label="seo" />
              <h1 className="heading-l">カテゴリが見つかりません</h1>
              <p className="paragraph-m opacity-64" style={{ margin: "2em 0 4em" }}>
                SEOカテゴリが存在しません。
              </p>
              <MainBtn label="back to blog" href="/blog" variant="inside" />
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
        tags: ["アルゴリズム", "クローリング", "E-E-A-T"],
        posts: getPostsByKeywords(chapter1Keywords),
      },
      {
        number: 2,
        title: "キーワード選定",
        description: "検索エンジンで上位表示を目指すためのSEO対策の第一歩は狙うべき検索キーワードのリサーチ、つまりキーワード選定から始まります。徹底的にキーワードリサーチを行うことで、「どれだけの需要があるのか」「どのようなコンテンツを作るべきか」が明確になります。",
        tags: ["キーワード選定", "ロングテールSEO", "検索クエリ"],
        posts: getPostsByKeywords(chapter2Keywords),
      },
      {
        number: 3,
        title: "オンページSEO",
        description: "オンページSEOというのはページ上のコンテンツとHTMLソースの最適化を行うSEO対策のことです。コンテンツの制作と各タグの最適化について詳しく解説します。コンテンツ制作は最も重要なSEO施策と位置付けられています。",
        tags: ["titleタグ", "見出しタグ", "meta description"],
        posts: getPostsByKeywords(chapter3Keywords),
      },
      {
        number: 4,
        title: "テクニカルSEO",
        description: "テクニカルSEOというのはサイト構造における技術的要件を検索エンジンに最適化させることです。Googleのクローラーが認識しやすいサイト構造にすることで、自身のサイトを正しく評価してもらいやすくなります。",
        tags: ["構造化データ", "サイトマップ", "ページ速度", "内部リンク"],
        posts: getPostsByKeywords(chapter4Keywords),
      },
      {
        number: 5,
        title: "被リンク獲得",
        description: "SEOを考えるうえでコンテンツの次に重要なのが被リンクです。被リンクとは「別のWebページからされたリンク」のことで、被リンクが多いほど、他ページで言及あるいは紹介されていると判断されます。",
        tags: ["被リンク", "ページランク", "外部リンク"],
        posts: getPostsByKeywords(chapter5Keywords),
      },
      {
        number: 6,
        title: "SEOの効果測定",
        description: "SEOを進めるうえでは、ただ施策を実施し続けるだけでなく適切な効果測定を行うことが重要になります。Google AnalyticsやSearch Consoleなどのツールを活用した分析方法について解説します。",
        tags: ["GA4", "Search Console", "Ahrefs"],
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

        <div className="tent-page" style={{ background: "#ffffff" }}>
          <TentBlogNav />

          <main id="main-content" style={{ paddingTop: "9em" }}>
            {/* ---------- hero ---------- */}
            <section className="tent-container">
              <ChapterLabel label="seo guide" />
              <ScrambleText as="h1" className="heading-l" mode="load" intensity={4}>
                SEO完全ガイド
              </ScrambleText>
              <div className="tent-doc__meta">
                <ScrambleText as="p" className="paragraph-m" mode="load" intensity={4}>
                  全6章・{total}記事
                </ScrambleText>
                <ScrambleText as="p" className="paragraph-m opacity-64" mode="load" intensity={4}>
                  仕組みの理解から効果測定まで、無料で読める学習ロードマップ
                </ScrambleText>
              </div>
              <p className="paragraph-l opacity-64" style={{ maxWidth: "46em", marginTop: "2em" }}>
                検索エンジンの仕組みから、キーワード選定、コンテンツとHTMLの最適化、テクニカルSEO、被リンク、効果測定まで。SEOを体系的に学ぶためのガイドです。初めての方は第1章から、施策が決まっている方は必要な章からどうぞ。
              </p>
            </section>

            {/* ---------- contributions strip ---------- */}
            <div style={{ position: "relative", height: "16vh", marginTop: "4em" }} aria-hidden="true">
              <HeroVisual />
            </div>

            {/* ---------- 目次 ---------- */}
            <section className="tent-container" style={{ paddingTop: "6em" }}>
              <ChapterLabel label="contents" />
              <div className="tent-stat-rows">
                {chapters.map((chapter) => (
                  <a
                    key={chapter.number}
                    href={`#chapter-${chapter.number}`}
                    className="tent-stat-row"
                    style={{ textDecoration: "none", color: "inherit", cursor: "crosshair" }}
                  >
                    <p className="paragraph-regular opacity-64">{String(chapter.number).padStart(2, "0")}</p>
                    <ScrambleText as="p" className="heading-s">
                      {chapter.title}
                    </ScrambleText>
                    <p className="paragraph-m opacity-64">{chapter.posts.length}記事</p>
                  </a>
                ))}
              </div>
            </section>

            {/* ---------- 学習ルート ---------- */}
            <section className="tent-container" style={{ paddingTop: "8em" }}>
              <div className="tent-diff__head" style={{ padding: "0 0 4em" }}>
                <ScrambleText as="h2" className="heading-s">
                  読む順番は、目的で選ぶ
                </ScrambleText>
                <ScrambleText as="p" className="paragraph-l">
                  how to read
                </ScrambleText>
              </div>
              <div className="tent-doc__rows" style={{ maxWidth: "62em" }}>
                {ROUTES.map(([who, route]) => (
                  <div key={who} className="tent-doc__row">
                    <p className="paragraph-regular opacity-64">{who}</p>
                    <p className="paragraph-regular">{route}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ---------- chapters ---------- */}
            <div className="tent-container" style={{ paddingTop: "8em" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10em" }}>
                {chapters.map((chapter) => (
                  <section key={chapter.number} id={`chapter-${chapter.number}`} className="scroll-mt-24">
                    {/* chapter header — tent */}
                    <div
                      style={{
                        display: "flex",
                        gap: "1.5em",
                        alignItems: "flex-start",
                        borderTop: "1px solid var(--m-ink)",
                        paddingTop: "1.5em",
                        marginBottom: "3em",
                      }}
                    >
                      <span className="tent-guide__chapter-num" aria-hidden="true">
                        {String(chapter.number).padStart(2, "0")}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <ScrambleText as="h2" className="heading-s">
                          {chapter.title}
                        </ScrambleText>
                        <p className="paragraph-regular opacity-64" style={{ maxWidth: "52em", marginTop: "1em", lineHeight: 1.7 }}>
                          {chapter.description}
                        </p>
                        <div className="tent-works__tags" style={{ marginTop: "1.25em" }}>
                          {chapter.tags.map((t) => (
                            <span key={t} className="tent-works__tag">
                              {t}
                            </span>
                          ))}
                          <span className="tent-works__tag" style={{ borderColor: "var(--m-border)", opacity: 0.7 }}>
                            {chapter.posts.length}記事
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* posts — 一覧と同じ意匠のカード */}
                    {chapter.posts.length > 0 ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
                        {chapter.posts.map((post: BlogPost) => (
                          <BlogPostCard key={post.id} post={post} />
                        ))}
                      </div>
                    ) : (
                      <p className="paragraph-m opacity-64">この章の記事は準備中です</p>
                    )}
                  </section>
                ))}
              </div>
            </div>

            {/* ---------- CTA: SEOに強いサイトづくり（入退場シャッター付き） ---------- */}
            <div style={{ marginTop: "12em" }}>
              <ShutterScroll variant="indigo" seed={81} />
            </div>
            <section className="tent-cta-band">
              <div className="tent-container">
                <ChapterLabel label="with tent space" />
                <ScrambleText as="h2" className="heading-m">
                  SEOに強いサイトづくり、お手伝いできます。
                </ScrambleText>
                <p className="paragraph-l" style={{ maxWidth: "44em", marginTop: "1.5em", opacity: 0.8 }}>
                  tent space は、SEOを踏まえたサイト設計・構築から、公開後の運用改善まで伴走します。このブログ自体が、私たちの実践の場です。まずは無料相談から、お気軽にどうぞ。
                </p>
                <div style={{ marginTop: "3.5em" }}>
                  <MainBtn label="start a project" href="/contact" variant="inside" twoLine />
                </div>
              </div>
            </section>
            <ShutterScroll variant="off-white" bg="indigo" seed={82} height="6em" />

            <TentFooterStandalone />
          </main>

          <FloatingContactButton label="SEOのご相談" />
        </div>
      </>
    )
  } catch (error) {
    console.error("Error loading SEO page:", error)

    return (
      <div className="tent-page" style={{ background: "#ffffff" }}>
        <TentBlogNav />
        <main id="main-content" className="tent-doc">
          <div className="tent-container">
            <ChapterLabel label="error" />
            <h1 className="heading-l">エラーが発生しました</h1>
            <p className="paragraph-m opacity-64" style={{ margin: "2em 0 4em" }}>
              ページの読み込み中にエラーが発生しました。しばらくしてから再度お試しください。
            </p>
            <MainBtn label="back to blog" href="/blog" variant="inside" />
          </div>
        </main>
      </div>
    )
  }
}
