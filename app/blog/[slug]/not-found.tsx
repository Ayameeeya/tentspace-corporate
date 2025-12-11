import Link from "next/link"
import Image from "next/image"
import { BlogHeader } from "@/components/blog-header"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <BlogHeader />
      
      <main className="pt-20">
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            記事が見つかりませんでした
          </h1>
          
          <p className="text-gray-600 mb-8">
            お探しの記事は削除されたか、URLが変更された可能性があります。
          </p>
          
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ブログ一覧へ戻る
          </Link>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 mt-auto">
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
              <nav className="flex items-center gap-6 text-sm text-gray-500">
                <Link href="/about" className="hover:text-gray-900 transition-colors">
                  About
                </Link>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">
                  利用規約
                </Link>
                <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                  プライバシー
                </Link>
              </nav>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

