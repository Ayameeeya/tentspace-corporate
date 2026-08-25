const historicalArticleRedirects = [
  [
    "/blog/【緊急】next-js／reactに深刻な脆弱性「react2shell」｜rceの実攻撃",
    "/blog/react2shell-vulnerability-alert",
  ],
  [
    "/blog/【上級者向け】n8nでragシステムを構築する｜ベクト",
    "/blog/n8n-rag-system-guide",
  ],
  [
    "/blog/【完全ガイド】n8n-webhookの使い方｜設定から認証・レス",
    "/blog/n8n-webhook-guide",
  ],
  [
    "/blog/【デバイス別】chatgptの始め方｜スマホ・pcそれぞれの",
    "/blog/chatgpt-device-setup-guide",
  ],
  [
    "/blog/n8n-aiエージェント活用ガイド｜2025年注目の自動化事例1",
    "/blog/n8n-ai-agent-guide",
  ],
  [
    "/blog/【seo】アンカーテキストとは？6つの種類と最適化",
    "/blog/anchor-text-guide",
  ],
  [
    "/blog/【seo】コンテンツseoとは？実践の4ステップと成功の",
    "/blog/content-seo-guide",
  ],
  [
    "/blog/【seo】alt属性とは？適切な設定方法と書き方を種類",
    "/blog/alt-attribute-guide",
  ],
  ["/blog/descartes", "/blog/descartes-philosophy-guide"],
  [
    "/blog/dockerの辛いところ｜20年現場で見てきた「便利だけど",
    "/blog/docker-challenges-guide",
  ],
  [
    "/blog/docker入門｜20年現場で見てきた環境構築の変遷と始め",
    "/blog/docker-beginner-guide",
  ],
  [
    "/blog/trello-mcp-ai経由でタスク管理を自動化する新しい業務効",
    "/blog/trello-mcp-ai-automation",
  ],
  [
    "/blog/【seo】パンくずリストとは？seo効果と設置方法を徹",
    "/blog/breadcrumb-guide",
  ],
  [
    "/blog/【seo】内部リンクとは？seoでの重要性と効果的な張",
    "/blog/internal-link-guide",
  ],
  [
    "/blog/【seo】seo効果測定とは？見るべき重要6指標と推奨ツ",
    "/blog/seo-measurement-guide",
  ],
  [
    "/blog/【seo】titleタグとは？検索順位とクリック率を上げる",
    "/blog/title-tag-guide",
  ],
  [
    "/blog/【seo】xmlサイトマップとは？seo効果と作成方法を徹底",
    "/blog/xml-sitemap-guide",
  ],
  [
    "/blog/【seo】被リンクとは？seo効果と良質なリンクの増や",
    "/blog/backlink-guide",
  ],
  [
    "/blog/【seo】htmlサイトマップとは？xmlとの違いと作り方を徹",
    "/blog/html-sitemap-guide",
  ],
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zbgzvbcgjvnsgildrmta.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "tentspace.net" }],
        destination: "https://www.tentspace.net/:path*",
        permanent: true,
      },
      ...historicalArticleRedirects.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      // 2026-08: 旧LP・旧料金ページを廃止（facts.md にない数値主張を含む
      // 旧軸のページだったため）。インデックス済み URL はトップへ逃がす
      { source: "/ai-development", destination: "/", permanent: true },
      { source: "/pricing", destination: "/", permanent: true },
    ]
  },
}

export default nextConfig
