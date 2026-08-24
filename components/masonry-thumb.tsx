"use client"

import Image from "next/image"

/**
 * メイソンリーカードのサムネイル画像。
 *
 * 実サムネイル（16:9・タイトル文字入りが多い）を縦長/正方形の枠に入れるときは
 * クロップすると文字が欠けるため、同じ画像を拡大ブラーで背面に敷いて枠を埋め、
 * 前面に元画像全体を object-contain で見せる（blur-fill）。
 * 実サムネイルが 16:9 枠に入るときと、ストックフォト（文字なし・クロップ耐性あり）の
 * ときは従来どおり object-cover でクロップする。
 */
export function MasonryThumb({
  src,
  alt,
  isRealThumb,
  variant,
}: {
  src: string
  alt: string
  isRealThumb: boolean
  variant: "tall" | "wide" | "square"
}) {
  const blurFill = isRealThumb && variant !== "wide"

  if (!blurFill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700"
      />
    )
  }

  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        className="object-cover scale-125 blur-2xl brightness-[0.94]"
      />
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain group-hover:scale-105 transition-transform duration-700"
      />
    </>
  )
}
