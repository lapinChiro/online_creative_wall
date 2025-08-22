import { ref, onMounted, onUnmounted } from 'vue'
import type { ScrollItem } from '@/types/scroll-item'
import { type PositionService } from '@/services/PositionService'
import { useScrollItemsStore } from '@/stores/scrollItems'

/**
 * スクロールアニメーションを管理するComposable
 * 単一のrequestAnimationFrameループで複数アイテムを効率的に処理
 */
export function useScrollAnimation(
  positionService: PositionService | null = null
) {
  const store = useScrollItemsStore()
  const isRunning = ref(false)
  const fps = ref(0)
  
  let animationFrameId: number | null = null
  let lastTime = performance.now()
  let frameCount = 0
  let lastFpsUpdate = performance.now()

  /**
   * バッチで複数アイテムの位置を更新
   * @param items 更新対象のアイテム配列
   * @param deltaTime 前フレームからの経過時間（秒）
   */
  const updateItemPositions = (items: ScrollItem[], deltaTime: number): void => {
    const batchSize = 10 // バッチ処理のサイズ
    const itemsToUpdate = items.slice(0, Math.min(items.length, 100)) // 最大100アイテムまで処理

    for (let i = 0; i < itemsToUpdate.length; i += batchSize) {
      const batch = itemsToUpdate.slice(i, i + batchSize)
      
      batch.forEach(item => {
        // 新しい位置を計算
        const newX = item.position.x - (item.velocity * deltaTime)
        const newPosition = { ...item.position, x: newX }

        // 画面外判定（簡易版）
        const itemWidth = getItemWidth(item)
        
        if (positionService?.shouldWrapAround(newPosition, itemWidth)) {
          // PositionServiceを使用してループ位置を取得
          const wrapPosition = positionService.getWrapAroundPosition()
          store.updateItemPosition(item.id, wrapPosition)
        } else if (newX < -itemWidth) {
          // フォールバック: 画面外に出たら右側に再配置
          const resetPosition = {
            x: window.innerWidth + 200 + Math.random() * 200,
            y: 20 + Math.random() * (window.innerHeight - 170)
          }
          store.updateItemPosition(item.id, resetPosition)
        } else {
          // 通常の位置更新
          store.updateItemPosition(item.id, newPosition)
        }
      })
    }
  }

  /**
   * アイテムの推定幅を取得
   * @param item スクロールアイテム
   * @returns 推定幅
   */
  const getItemWidth = (item: ScrollItem): number => {
    if (item.type === 'image') {
      // 画像サイズに基づいて推定
      const sizeMap = {
        small: 100,
        medium: 120,
        large: 150,
        xlarge: 180
      }
      return sizeMap[item.content.size] || 120
    } else {
      // テキストの場合は固定値
      return 200
    }
  }

  /**
   * FPS計算
   */
  const updateFps = (currentTime: number): void => {
    frameCount++
    const elapsed = currentTime - lastFpsUpdate
    
    if (elapsed >= 1000) {
      fps.value = Math.round((frameCount * 1000) / elapsed)
      frameCount = 0
      lastFpsUpdate = currentTime
    }
  }

  /**
   * アニメーションループ
   */
  const animate = (currentTime: number): void => {
    if (!isRunning.value) {return}

    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1) // 最大0.1秒のデルタタイム
    lastTime = currentTime

    // FPS更新
    updateFps(currentTime)

    // 表示中のアイテムのみ処理
    const visibleItems = store.visibleItems
    if (visibleItems.length > 0) {
      updateItemPositions(visibleItems, deltaTime)
    }

    animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * アニメーション開始
   */
  const start = (): void => {
    if (!isRunning.value) {
      isRunning.value = true
      lastTime = performance.now()
      frameCount = 0
      lastFpsUpdate = performance.now()
      animationFrameId = requestAnimationFrame(animate)
    }
  }

  /**
   * アニメーション停止
   */
  const stop = (): void => {
    if (isRunning.value) {
      isRunning.value = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    }
  }

  /**
   * アニメーション一時停止/再開のトグル
   */
  const toggle = (): void => {
    if (isRunning.value) {
      stop()
    } else {
      start()
    }
  }

  /**
   * パフォーマンス情報を取得
   */
  const getPerformanceInfo = (): { fps: number; isRunning: boolean; itemCount: number } => {
    return {
      fps: fps.value,
      isRunning: isRunning.value,
      itemCount: store.visibleItems.length
    }
  }

  /**
   * ボード寸法の更新を処理
   */
  const handleResize = (): void => {
    if (positionService) {
      const width = window.innerWidth - 60
      const height = window.innerHeight - 120
      positionService.updateBoardDimensions(width, height)
    }
  }

  return {
    isRunning,
    fps,
    start,
    stop,
    toggle,
    getPerformanceInfo,
    handleResize
  }
}

/**
 * グローバルアニメーションマネージャー
 * アプリケーション全体で単一のアニメーションループを管理
 */
export class GlobalAnimationManager {
  private static instance: GlobalAnimationManager | null = null
  private animationFrameId: number | null = null
  private subscribers: Set<(deltaTime: number) => void> = new Set()
  private isRunning = false
  private lastTime = performance.now()

  private constructor() {}

  static getInstance(): GlobalAnimationManager {
    if (!GlobalAnimationManager.instance) {
      GlobalAnimationManager.instance = new GlobalAnimationManager()
    }
    return GlobalAnimationManager.instance
  }

  /**
   * アニメーションループにサブスクライブ
   */
  subscribe(callback: (deltaTime: number) => void): () => void {
    this.subscribers.add(callback)
    
    // 初回サブスクライバーの場合、アニメーションを開始
    if (this.subscribers.size === 1 && !this.isRunning) {
      this.start()
    }

    // アンサブスクライブ関数を返す
    return () => {
      this.subscribers.delete(callback)
      
      // サブスクライバーがいなくなったら停止
      if (this.subscribers.size === 0) {
        this.stop()
      }
    }
  }

  private animate = (currentTime: number) => {
    if (!this.isRunning) {return}

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1)
    this.lastTime = currentTime

    // すべてのサブスクライバーに通知
    this.subscribers.forEach(callback => {
      try {
        callback(deltaTime)
      } catch (error) {
        console.error('Animation callback error:', error)
      }
    })

    this.animationFrameId = requestAnimationFrame(this.animate)
  }

  private start() {
    if (!this.isRunning) {
      this.isRunning = true
      this.lastTime = performance.now()
      this.animationFrameId = requestAnimationFrame(this.animate)
    }
  }

  private stop() {
    if (this.isRunning) {
      this.isRunning = false
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
      }
    }
  }

  /**
   * 手動でアニメーションを開始/停止
   */
  forceStart() {
    this.start()
  }

  forceStop() {
    this.stop()
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      subscriberCount: this.subscribers.size
    }
  }
}

/**
 * グローバルアニメーションマネージャーを使用するComposable
 */
export function useGlobalAnimation(
  callback: (deltaTime: number) => void
): {
  unsubscribe: () => void
  manager: GlobalAnimationManager
} {
  const manager = GlobalAnimationManager.getInstance()
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = manager.subscribe(callback)
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    unsubscribe: () => {
      if (unsubscribe) {
        unsubscribe()
      }
    },
    manager
  }
}