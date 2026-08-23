import type { Metadata } from "next"
import { notFound } from "next/navigation"
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
  stripHtml,
  type BlogPost,
} from "@/lib/blog-content"
import { SITE_URL } from "@/lib/site"

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

// 章の定義
const chapters = [
  {
    id: 1,
    title: "n8nの基礎知識",
    description: "n8nを使い始める前に、まずは基本的な概念を理解しましょう。n8nとは何か、どのような特徴があるのか、なぜ注目されているのかを解説します。プログラミング未経験の方でも、この章を読めばn8nの全体像を把握できます。",
    keywords: ["n8nとは", "読み方", "ノーコード"],
    articles: 2,
  },
  {
    id: 2,
    title: "n8nの導入・セットアップ",
    description: "n8nを実際に使い始めるための環境構築方法を解説します。手軽に試せるローカル環境から、Docker Composeを使った本格的なセルフホスト環境、VPSでの本番運用まで、目的に応じた導入方法を学べます。",
    keywords: ["Docker", "インストール", "ローカル", "Compose", "セルフホスト", "VPS", "PostgreSQL"],
    articles: 7,
  },
  {
    id: 3,
    title: "n8nの使い方",
    description: "n8nの基本的な操作方法を学びます。ワークフローの作成方法、ノードの設定、Webhookの活用、公式テンプレートの使い方など、実際に手を動かしながら習得できるチュートリアル形式で解説します。",
    keywords: ["使い方", "初心者", "始め方", "Webhook", "テンプレート"],
    articles: 4,
  },
  {
    id: 4,
    title: "AI・LLM連携",
    description: "n8nの最大の強みの一つが、OpenAI、ChatGPT、Claude、LangChainなどのAI/LLMとの連携です。単なるAPI呼び出しだけでなく、RAG（検索拡張生成）や自律的に判断して行動する「AIエージェント」の構築方法まで、最先端のAI自動化を学べます。",
    keywords: ["OpenAI", "ChatGPT", "Claude", "AIエージェント", "LangChain", "RAG", "MCP"],
    articles: 7,
  },
  {
    id: 5,
    title: "他ツールとの比較",
    description: "業務自動化ツールは、n8n以外にもZapier、Makeなど複数の選択肢があります。それぞれの特徴、料金体系、得意分野を比較し、自分に最適なツールを選ぶための情報を提供します。",
    keywords: ["Zapier", "Make", "vs"],
    articles: 2,
  },
  {
    id: 6,
    title: "料金・ライセンス",
    description: "n8nの料金体系、無料で使える範囲、商用利用時の注意点について解説します。セルフホスト版とクラウド版の違い、フェアコードライセンスの詳細、コストを最適化する方法を理解し、安心してn8nを導入できます。",
    keywords: ["料金", "プラン", "無料", "コスト", "フェアコード", "ライセンス"],
    articles: 3,
  },
  {
    id: 7,
    title: "活用事例・ワークフローレシピ",
    description: "n8nで実現できる具体的な自動化事例を紹介します。Gmail自動返信、Slack通知、Google Sheets連携、CMS連携など、すぐに使える実践的なワークフローレシピを掲載。営業、マーケティング、カスタマーサポート、経理、開発など、部門別のユースケースも学べます。",
    keywords: ["ワークフロー", "活用事例", "Gmail", "Slack", "Google Sheets", "CMS", "自動化"],
    articles: 6,
  },
]

const ROUTES = [
  ["初めての方", "01 → 02 → 03 の順で、基礎から確実に"],
  ["AI連携が目的の方", "01〜03で基礎を掴み、04でAIエージェントへ"],
  ["ツール選定中の方", "01と05で、n8nが合うかを判断"],
  ["実践重視の方", "07の事例から始めて、必要な章を参照"],
]

// 記事を章ごとに分類
function categorizePostsByChapter(posts: BlogPost[]) {
  const postsByChapter = new Map<number, BlogPost[]>()

  posts.forEach((post) => {
    const title = stripHtml(post.title).toLowerCase()

    for (const chapter of chapters) {
      const matchesKeyword = chapter.keywords.some((keyword) =>
        title.includes(keyword.toLowerCase())
      )

      if (matchesKeyword) {
        const chapterPosts = postsByChapter.get(chapter.id) || []
        chapterPosts.push(post)
        postsByChapter.set(chapter.id, chapterPosts)
        break
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

  const { posts, total } = await getPosts({
    categories: [category.id],
    perPage: 100,
  })

  const postsByChapter = categorizePostsByChapter(posts)

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

      <div className="tent-page" style={{ background: "#ffffff" }}>
        <TentBlogNav />

        <main id="main-content" style={{ paddingTop: "9em" }}>
          {/* ---------- hero ---------- */}
          <section className="tent-container">
            <ChapterLabel label="n8n guide" />
            <ScrambleText as="h1" className="heading-l" mode="load" intensity={4}>
              n8n完全ガイド
            </ScrambleText>
            <div className="tent-doc__meta">
              <ScrambleText as="p" className="paragraph-m" mode="load" intensity={4}>
                全7章・{total}記事
              </ScrambleText>
              <ScrambleText as="p" className="paragraph-m opacity-64" mode="load" intensity={4}>
                基礎から実践まで、無料で読める学習ロードマップ
              </ScrambleText>
            </div>
            <p className="paragraph-l opacity-64" style={{ maxWidth: "46em", marginTop: "2em" }}>
              業務自動化ツール「n8n」を体系的に学ぶためのガイドです。基礎知識から導入・セットアップ、AI連携、実践的な活用事例まで。初めての方は第1章から、目的が決まっている方は必要な章から読み進めてください。
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
                  key={chapter.id}
                  href={`#chapter-${chapter.id}`}
                  className="tent-stat-row"
                  style={{ textDecoration: "none", color: "inherit", cursor: "crosshair" }}
                >
                  <p className="paragraph-regular opacity-64">{String(chapter.id).padStart(2, "0")}</p>
                  <ScrambleText as="p" className="heading-s">
                    {chapter.title}
                  </ScrambleText>
                  <p className="paragraph-m opacity-64">{chapter.articles}記事</p>
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
            {posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "8em 0" }}>
                <p className="paragraph-m opacity-64">記事がまだありません</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10em" }}>
                {chapters.map((chapter) => {
                  const chapterPosts = postsByChapter.get(chapter.id) || []

                  if (chapterPosts.length === 0) return null

                  return (
                    <section key={chapter.id} id={`chapter-${chapter.id}`} className="scroll-mt-24">
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
                          {String(chapter.id).padStart(2, "0")}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <ScrambleText as="h2" className="heading-s">
                            {chapter.title}
                          </ScrambleText>
                          <p className="paragraph-regular opacity-64" style={{ maxWidth: "52em", marginTop: "1em", lineHeight: 1.7 }}>
                            {chapter.description}
                          </p>
                          <div className="tent-works__tags" style={{ marginTop: "1.25em" }}>
                            {chapter.keywords.slice(0, 5).map((k) => (
                              <span key={k} className="tent-works__tag">
                                {k}
                              </span>
                            ))}
                            <span className="tent-works__tag" style={{ borderColor: "var(--m-border)", opacity: 0.7 }}>
                              {chapterPosts.length}記事
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* posts — 一覧と同じ意匠のカード */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
                        {chapterPosts.map((post) => (
                          <BlogPostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            )}
          </div>

          {/* ---------- CTA: n8n導入・構築サポート（入退場シャッター付き） ---------- */}
          <div style={{ marginTop: "12em" }}>
            <ShutterScroll variant="indigo" seed={71} />
          </div>
          <section className="tent-cta-band">
            <div className="tent-container">
              <ChapterLabel label="with tent space" />
              <ScrambleText as="h2" className="heading-m">
                n8nの導入、お手伝いできます。
              </ScrambleText>
              <p className="paragraph-l" style={{ maxWidth: "44em", marginTop: "1.5em", opacity: 0.8 }}>
                tent space は n8n の導入・ワークフロー構築・運用サポートを行っています。要件の整理から環境構築、AIエージェント連携、保守まで。まずは無料相談から、お気軽にどうぞ。
              </p>
              <div style={{ marginTop: "3.5em" }}>
                <MainBtn label="start a project" href="/contact" variant="inside" twoLine />
              </div>
            </div>
          </section>
          <ShutterScroll variant="off-white" bg="indigo" seed={72} height="6em" />

          <TentFooterStandalone />
        </main>

        <FloatingContactButton label="n8n導入のご相談" />
      </div>
    </>
  )
}
