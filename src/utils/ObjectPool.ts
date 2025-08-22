/**
 * ジェネリック型対応のオブジェクトプール実装
 * オブジェクトの生成/破棄コストを削減し、GC負荷を軽減
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void
  private maxSize: number
  private createdCount = 0
  private reuseCount = 0
  
  /**
   * @param factory オブジェクトを生成する関数
   * @param reset オブジェクトをリセットする関数
   * @param maxSize プールの最大サイズ（デフォルト: 100）
   */
  constructor(factory: () => T, reset: (obj: T) => void, maxSize = 100) {
    this.factory = factory
    this.reset = reset
    this.maxSize = maxSize
    
    // 事前割り当て（初期プール作成）
    const initialSize = Math.min(10, maxSize)
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory())
      this.createdCount++
    }
  }
  
  /**
   * プールからオブジェクトを取得
   * プールが空の場合は新規作成
   */
  acquire(): T {
    const obj = this.pool.pop()
    if (obj !== undefined) {
      this.reuseCount++
      return obj
    }
    
    this.createdCount++
    return this.factory()
  }
  
  /**
   * オブジェクトをプールに返却
   * プールが満杯の場合は破棄
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj)
      this.pool.push(obj)
    }
    // maxSizeを超える場合は破棄（GCに任せる）
  }
  
  /**
   * プールの現在のサイズを取得
   */
  getPoolSize(): number {
    return this.pool.length
  }
  
  /**
   * プールの統計情報を取得（デバッグ用）
   */
  getStats(): { created: number; reused: number; poolSize: number; reuseRate: number } {
    const total = this.createdCount + this.reuseCount
    return {
      created: this.createdCount,
      reused: this.reuseCount,
      poolSize: this.pool.length,
      reuseRate: total > 0 ? (this.reuseCount / total) * 100 : 0
    }
  }
  
  /**
   * プールをクリア
   */
  clear(): void {
    this.pool.length = 0
  }
}