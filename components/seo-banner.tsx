import Link from "next/link"
import Image from "next/image"

type SeoBannerProps = {
  layout?: 'vertical' | 'horizontal'
}

export function SeoBanner({ layout = 'vertical' }: SeoBannerProps) {
  if (layout === 'horizontal') {
    // n8nスタイルの横長レイアウト
    return (
      <div className="w-full h-full">
        <Link href="/blog/seo" className="block h-full">
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
                        AI時代のSEO戦略にアクセス。
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        いつでも無料で学習可能。
                      </p>
                    </div>
                  </div>

                  {/* 下部CTA */}
                  <div className="mt-8">
                    <span className="inline-flex items-center px-6 py-2 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 transition-all">
                      SEO特設サイトを見る
                    </span>
                  </div>
                </div>

                {/* 右側ビジュアル（半分） - 余白なし */}
                <div className="relative h-full min-h-[180px] md:min-h-[200px]">
                  {/* 背景の写真 */}
                  <Image
                    src="/blog-placeholders/oleg-laptev-QRKJwE6yfJo.jpg"
                    alt="SEO Learning"
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

  // デフォルトの縦長レイアウト
  return (
    <div className="h-full">
      <Link href="/blog/seo" className="block h-full">
        <div className="bg-background rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
          {/* 上部ビジュアル */}
          <div className="relative h-32 md:h-40 overflow-hidden">
            <Image
              src="/blog-placeholders/oleg-laptev-QRKJwE6yfJo.jpg"
              alt="SEO Learning"
              fill
              className="object-cover"
            />
            {/* グラデーションオーバーレイ */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>

          {/* 下部テキスト */}
          <div className="flex flex-col justify-between p-6 md:p-8 flex-1">
            <div className="space-y-3">
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
                <h3 className="text-base md:text-xl font-bold text-foreground leading-tight">
                  AI時代のSEO戦略にアクセス。
                </h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  いつでも無料で学習可能。
                </p>
              </div>
            </div>

            {/* 下部CTA */}
            <div className="mt-6">
              <span className="inline-flex items-center px-6 py-2 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 transition-all">
                SEO特設サイトを見る
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
