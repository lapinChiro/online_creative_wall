/**
 * 指定範囲内のランダムな小数を生成
 * @param min 最小値
 * @param max 最大値
 * @returns min以上max以下のランダムな小数
 */
export const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min)
}

// エイリアス
export const randomFloat = randomRange

/**
 * 指定範囲内のランダムな整数を生成
 * @param min 最小値（含む）
 * @param max 最大値（含む）
 * @returns min以上max以下のランダムな整数
 */
export const randomInt = (min: number, max: number): number => {
  // minとmaxが逆の場合は入れ替える
  if (min > max) {
    [min, max] = [max, min]
  }
  return Math.floor(randomRange(min, max + 1))
}

/**
 * 配列からランダムに要素を選択
 * @param array 選択元の配列
 * @returns ランダムに選択された要素
 */
export const randomChoice = <T>(array: readonly T[]): T => {
  if (array.length === 0) {
    throw new Error('Cannot choose from empty array')
  }
  return array[randomInt(0, array.length - 1)]
}

// エイリアス
export const randomElement = <T>(array: readonly T[]): T | undefined => {
  if (array.length === 0) {
    return undefined
  }
  return array[randomInt(0, array.length - 1)]
}

/**
 * 配列をシャッフル（Fisher-Yates algorithm）
 * @param array シャッフルする配列
 * @returns シャッフルされた配列（破壊的変更）
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * 指定された確率でtrueを返す
 * @param probability 確率（0.0〜1.0）
 * @returns 指定確率でtrue
 */
export const randomBool = (probability: number = 0.5): boolean => {
  return Math.random() < probability
}