import { ref, type Ref } from 'vue'
import type { ScrollItem } from '@/types/scroll-item'
import { type PositionService } from '@/services/PositionService'
import { useScrollItemsStore } from '@/stores/scrollItems'
import { calculateBoardSize, SCROLL_CONFIG } from '@/config/scroll.config'
import { positionPool } from '@/utils/PositionPool'

/**
 * スクロールアニメーションを管理するComposable
 * 単一のrequestAnimationFrameループで複数アイテムを効率的に処理
 */
interface UseScrollAnimationReturn {
  isRunning: Ref<boolean>
  fps: Ref<number>
  start: () => void
  stop: () => void
  toggle: () => void
  getPerformanceInfo: () => { fps: number; isRunning: boolean; itemCount: number }
  handleResize: () => void
}

export function useScrollAnimation(
  positionService: PositionService | null = null
): UseScrollAnimationReturn {
  const store = useScrollItemsStore()
  const isRunning = ref(false)
  const fps = ref(0)
  
  let animationFrameId: number | null = null
  let lastTime = performance.now()
  let frameCount = 0
  let lastFpsUpdate = performance.now()

  /**
   * バッチで複数アイテムの位置を更新（最適化版）
   * @param items 更新対象のアイテム配列
   * @param deltaTime 前フレームからの経過時間（秒）
   */
  const updateItemPositions = (items: ScrollItem[], deltaTime: number): void => {
    const batchSize = SCROLL_CONFIG.animation.batchSize
    const maxItems = SCROLL_CONFIG.performance.maxConcurrentAnimations
    const itemsToUpdate = items.slice(0, Math.min(items.length, maxItems))
    
    // 一時オブジェクトプール使用
    const tempPos = positionPool.acquire()
    
    for (let i = 0; i < itemsToUpdate.length; i += batchSize) {
      const batch = itemsToUpdate.slice(i, i + batchSize)
      
      batch.forEach(item => {
        // オブジェクト生成を完全回避
        const newX = item.position.x - (item.velocity * deltaTime)
        const itemWidth = getItemWidth(item)
        
        if (positionService?.shouldWrapAroundDirect(newX, item.position.y, itemWidth) === true) {
          // PositionServiceを使用してループ位置を取得（直接更新）
          positionService.getWrapAroundPositionDirect(tempPos)
          store.updateItemPositionDirect(item.id, tempPos.x, tempPos.y)
        } else if (newX < -itemWidth) {
          // フォールバック: 画面外に出たら右側に再配置（直接更新）
          store.updateItemPositionDirect(
            item.id,
            window.innerWidth + 200 + Math.random() * 200,
            20 + Math.random() * (window.innerHeight - 170)
          )
        } else {
          // 通常の位置更新（直接更新）
          store.updateItemPositionDirect(item.id, newX, item.position.y)
        }
      })
    }
    
    // プールに返却
    positionPool.release(tempPos)
  }

  /**
   * アイテムの推定幅を取得
   * @param item スクロールアイテム
   * @returns 推定幅
   */
  const getItemWidth = (item: ScrollItem): number => {
    if (item.type === 'image') {
      // SCROLL_CONFIG からサイズを取得
      return SCROLL_CONFIG.sizes.image[item.content.size].width
    } else {
      // テキストの場合は推定値（フォントサイズ × 文字数基準）
      return Math.min(item.content.text.length * item.content.fontSize * 12, 300)
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
      if (animationFrameId !== null) {
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
    if (positionService !== null) {
      const newBoardSize = calculateBoardSize()
      positionService.updateBoardDimensions(newBoardSize.width, newBoardSize.height)
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

