/**
 * アイキャッチ画像を持たない記事に出すダミー画像。
 * 記事 ID から決定的に選ぶため、同じ記事には常に同じ画像が出る。
 */
const PLACEHOLDER_IMAGES = [
  "/blog-placeholders/annie-spratt-oCqCLEPOf40.jpg",
  "/blog-placeholders/krystal-ng-1PlVbeOCd78.jpg",
  "/blog-placeholders/bharath-kumar-biXeua5P7ZU.jpg",
  "/blog-placeholders/olli-kilpi-K7EEEPFFjh0.jpg",
  "/blog-placeholders/resource-database-KhPkJtxuYg0.jpg",
  "/blog-placeholders/alex-sherstnev-MnJy18t6Doo.jpg",
  "/blog-placeholders/katie-doherty-6RRtOg4AI28.jpg",
  "/blog-placeholders/russ-lee-vJmW9KI9-ig.jpg",
  "/blog-placeholders/krystal-ng-PrQqQVPzmlw.jpg",
  "/blog-placeholders/maxim-tolchinskiy-MJB86VteX64.jpg",
]

/**
 * ダミー画像を 1 枚選ぶ。
 *
 * @param postId 記事 ID。同じ ID なら常に同じ画像を返す
 * @param index 一覧での並び位置。渡すと並び位置も混ぜ、近接するカードで
 *              同じ画像が並びにくくなる。詳細ページなど並びがない場所では省く
 */
export function getPlaceholderImage(postId: number, index?: number): string {
  const count = PLACEHOLDER_IMAGES.length
  const postOffset = Math.abs(postId * 2654435761) % count

  if (index === undefined) return PLACEHOLDER_IMAGES[postOffset]

  // 10 件ごとのブロックで開始位置をずらし、同じ画像の再出現周期を散らす
  const blockOffset = (Math.floor(index / count) * 7) % count
  return PLACEHOLDER_IMAGES[((index % count) + blockOffset + postOffset) % count]
}
