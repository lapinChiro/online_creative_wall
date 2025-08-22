/**
 * 指定範囲内のランダムな小数を生成
 * @param min 最小値
 * @param max 最大値
 * @returns min以上max以下のランダムな小数
 */
export const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min)
}

// randomFloat removed - unused export for better tree-shaking

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
  const index = randomInt(0, array.length - 1)
  const result = array[index]
  if (result === undefined) {
    throw new Error('Unexpected undefined value in array')
  }
  return result
}

