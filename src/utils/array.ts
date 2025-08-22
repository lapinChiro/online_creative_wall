/**
 * 配列をシャッフル（ランダムに並び替え）
 * @param array シャッフルする配列
 * @returns シャッフルされた新しい配列
 */
export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[j]
    const currentItem = shuffled[i]
    if (temp !== undefined && currentItem !== undefined) {
      shuffled[j] = currentItem
      shuffled[i] = temp
    }
  }
  return shuffled
}

/**
 * 配列を指定サイズのチャンクに分割
 * @param array 分割する配列
 * @param size チャンクサイズ
 * @returns チャンクの配列
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 配列から重複を除去
 * @param array 対象の配列
 * @returns 重複を除去した新しい配列
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)]
}

/**
 * 配列の最後の要素を取得
 * @param array 対象の配列
 * @returns 最後の要素（空配列の場合はundefined）
 */
export const last = <T>(array: T[]): T | undefined => {
  return array[array.length - 1]
}

/**
 * 配列の最初の要素を取得
 * @param array 対象の配列
 * @returns 最初の要素（空配列の場合はundefined）
 */
export const first = <T>(array: T[]): T | undefined => {
  return array[0]
}