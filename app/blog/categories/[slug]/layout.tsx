import type { ReactNode } from "react"
import type { Metadata } from "next"
import { getCategories, getCategoryBySlug } from "@/lib/blog-content"
import { SITE_URL } from "@/lib/site"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return {
      title: "カテゴリが見つかりません",
      robots: { index: false, follow: false },
    }
  }

  const title = `${category.name}の記事一覧`
  const description = `${category.name}に関する記事を${category.count}件掲載しています。実務に役立つ技術情報をtent spaceがお届けします。`
  const canonicalUrl = `${SITE_URL}/blog/categories/${category.slug}`
  const socialImage = `${SITE_URL}/logo_gradation_yoko.png`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "tent space Blog",
      locale: "ja_JP",
      type: "website",
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((category) => ({
    slug: decodeURIComponent(category.slug),
  }))
}

export default function CategoryLayout({ children }: { children: ReactNode }) {
  return children
}
