/**
 * 配列操作のユーティリティ関数群
 * パフォーマンスを考慮した最適化実装
 */

/**
 * 配列が等しいかを高速に判定
 * @param a 配列1
 * @param b 配列2
 * @param compareFunc カスタム比較関数（オプション）
 * @returns 等しい場合true
 */
export function arraysEqual<T>(
  a: T[],
  b: T[],
  compareFunc?: (a: T, b: T) => boolean
): boolean {
  // 長さが異なれば即座にfalse
  if (a.length !== b.length) {
    return false
  }
  
  // 同じ参照なら即座にtrue
  if (a === b) {
    return true
  }
  
  // 要素を比較
  if (compareFunc !== undefined) {
    // カスタム比較関数使用
    for (let i = 0; i < a.length; i++) {
      const aItem = a[i]
      const bItem = b[i]
      if (aItem === undefined || bItem === undefined || !compareFunc(aItem, bItem)) {
        return false
      }
    }
  } else {
    // 厳密等価性（===）で比較
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false
      }
    }
  }
  
  return true
}

/**
 * 配列の差分を効率的に検出
 * @param oldArray 旧配列
 * @param newArray 新配列
 * @param keyFunc アイテムのキーを取得する関数
 * @returns 追加・削除・維持されたアイテム
 */
export function arrayDiff<T>(
  oldArray: T[],
  newArray: T[],
  keyFunc: (item: T) => unknown
): {
  added: T[]
  removed: T[]
  kept: T[]
} {
  const oldMap = new Map<unknown, T>()
  const newMap = new Map<unknown, T>()
  
  // Mapを作成（O(n)）
  oldArray.forEach(item => {
    oldMap.set(keyFunc(item), item)
  })
  
  newArray.forEach(item => {
    newMap.set(keyFunc(item), item)
  })
  
  const added: T[] = []
  const removed: T[] = []
  const kept: T[] = []
  
  // 新規追加と維持を検出
  newArray.forEach(item => {
    const key = keyFunc(item)
    if (oldMap.has(key)) {
      kept.push(item)
    } else {
      added.push(item)
    }
  })
  
  // 削除を検出
  oldArray.forEach(item => {
    const key = keyFunc(item)
    if (!newMap.has(key)) {
      removed.push(item)
    }
  })
  
  return { added, removed, kept }
}

/**
 * 配列の浅いコピーを高速に作成
 * @param array 元の配列
 * @returns コピーされた配列
 */
export function shallowCopyArray<T>(array: T[]): T[] {
  // スプレッド演算子より高速な場合がある
  const length = array.length
  const copy = new Array<T>(length)
  for (let i = 0; i < length; i++) {
    const item = array[i]
    if (item !== undefined) {
      copy[i] = item
    }
  }
  return copy
}

/**
 * 配列から重複を効率的に除去
 * @param array 元の配列
 * @param keyFunc キー取得関数（オプション）
 * @returns 重複を除去した配列
 */
export function uniqueArray<T>(
  array: T[],
  keyFunc?: (item: T) => unknown
): T[] {
  if (keyFunc === undefined) {
    // プリミティブ値の場合はSetを使用
    return Array.from(new Set(array))
  }
  
  // オブジェクトの場合はMapを使用
  const seen = new Map<unknown, T>()
  array.forEach(item => {
    const key = keyFunc(item)
    if (!seen.has(key)) {
      seen.set(key, item)
    }
  })
  
  return Array.from(seen.values())
}

/**
 * 配列をバッチ処理用に分割
 * @param array 元の配列
 * @param batchSize バッチサイズ
 * @returns バッチ配列
 */
export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  const length = array.length
  
  for (let i = 0; i < length; i += batchSize) {
    batches.push(array.slice(i, Math.min(i + batchSize, length)))
  }
  
  return batches
}

/**
 * 配列の最初のN個の要素を効率的に取得
 * @param array 元の配列
 * @param n 取得する要素数
 * @returns 最初のN個の要素
 */
export function takeFirst<T>(array: T[], n: number): T[] {
  // sliceより高速な場合がある
  const length = Math.min(n, array.length)
  const result: T[] = []
  for (let i = 0; i < length; i++) {
    const item = array[i]
    if (item !== undefined) {
      result.push(item)
    }
  }
  return result
}

/**
 * 配列をインプレースでシャッフル（Fisher-Yates）
 * @param array シャッフルする配列
 * @returns シャッフルされた同じ配列
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const iItem = array[i]
    const jItem = array[j]
    if (iItem !== undefined && jItem !== undefined) {
      array[i] = jItem
      array[j] = iItem
    }
  }
  return array
}

/**
 * 配列内でアイテムを効率的に移動
 * @param array 配列
 * @param fromIndex 移動元インデックス
 * @param toIndex 移動先インデックス
 * @returns 新しい配列
 */
export function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array]
  const [item] = result.splice(fromIndex, 1)
  if (item !== undefined) {
    result.splice(toIndex, 0, item)
  }
  return result
}