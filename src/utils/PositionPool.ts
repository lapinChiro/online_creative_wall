import { ObjectPool } from './ObjectPool'
import { logger } from './logger'

/**
 * Position型の定義
 */
export interface Position {
  x: number
  y: number
}

/**
 * Position専用のオブジェクトプール
 * アニメーションループで頻繁に使用されるPosition型のオブジェクト生成を最適化
 */
class PositionPoolManager {
  private pool: ObjectPool<Position>
  
  constructor() {
    // Position型のファクトリー関数
    const factory = (): Position => ({ x: 0, y: 0 })
    
    // Position型のリセット関数
    const reset = (pos: Position): void => {
      pos.x = 0
      pos.y = 0
    }
    
    // 200個までプールに保持（アニメーション要素数を考慮）
    this.pool = new ObjectPool(factory, reset, 200)
  }
  
  /**
   * Positionオブジェクトを取得
   */
  acquire(): Position {
    return this.pool.acquire()
  }
  
  /**
   * 指定座標でPositionオブジェクトを取得
   */
  acquireWithValues(x: number, y: number): Position {
    const pos = this.pool.acquire()
    pos.x = x
    pos.y = y
    return pos
  }
  
  /**
   * Positionオブジェクトを返却
   */
  release(pos: Position): void {
    this.pool.release(pos)
  }
  
  /**
   * 複数のPositionオブジェクトを一括取得
   */
  acquireMultiple(count: number): Position[] {
    const positions: Position[] = []
    for (let i = 0; i < count; i++) {
      positions.push(this.pool.acquire())
    }
    return positions
  }
  
  /**
   * 複数のPositionオブジェクトを一括返却
   */
  releaseMultiple(positions: Position[]): void {
    for (const pos of positions) {
      this.pool.release(pos)
    }
  }
  
  /**
   * プールの統計情報を取得（デバッグ用）
   */
  getStats(): { created: number; reused: number; poolSize: number; reuseRate: number } {
    return this.pool.getStats()
  }
  
  /**
   * プールをクリア
   */
  clear(): void {
    this.pool.clear()
  }
}

// グローバルインスタンスをエクスポート
export const positionPool = new PositionPoolManager()

// デバッグ用: パフォーマンス監視
if (import.meta.env.DEV) {
  // 開発環境では5秒ごとに統計情報をログ出力
  setInterval(() => {
    const stats = positionPool.getStats()
    if (stats.created > 0 || stats.reused > 0) {
      logger.debug('[PositionPool Stats]', {
        ...stats,
        reuseRate: `${stats.reuseRate.toFixed(1)}%`
      })
    }
  }, 5000)
}