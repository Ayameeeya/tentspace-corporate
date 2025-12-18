import Link from "next/link"
import Image from "next/image"

export function N8nBanner() {
  return (
    <div className="w-full h-full">
      <Link href="/blog/n8n" className="block h-full">
        <div className="bg-background rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full">
          <div className="relative h-full">
            {/* グリッドレイアウト：左テキスト、右ビジュアル */}
            <div className="grid grid-cols-2 h-full">
              {/* 左側テキスト（半分） - パディング付き */}
              <div className="flex flex-col justify-between p-6 md:p-8">
                <div className="space-y-4">
                  {/* ロゴ */}
                  <div className="w-8 h-8 md:w-10 md:h-10 relative">
                    <Image
                      src="/logo_black_symbol.png"
                      alt="tent space"
                      fill
                      className="object-contain dark:invert"
                    />
                  </div>

                  {/* テキスト */}
                  <div className="space-y-2">
                    <h3 className="text-base md:text-xl font-bold text-foreground leading-relaxed">
                      n8nで業務自動化を実現。
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      ノーコードで始める次世代ワークフロー自動化。実践的なガイドを無料公開中。
                    </p>
                  </div>
                </div>

                {/* 下部CTA */}
                <div className="mt-8">
                  <span className="inline-flex items-center px-6 py-2 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 transition-all">
                    n8n特設サイトを見る
                  </span>
                </div>
              </div>

              {/* 右側ビジュアル（半分） - 余白なし */}
              <div className="relative h-full min-h-[180px] md:min-h-[200px]">
                {/* 背景の写真 */}
                <Image
                  src="/blog-placeholders/image_mc3l8pmc3l8pmc3l.png"
                  alt="n8n Automation"
                  fill
                  className="object-cover"
                />
                {/* オーバーレイグラデーション */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
