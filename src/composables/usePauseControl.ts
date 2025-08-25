import { computed, type ComputedRef } from 'vue'
import { useScrollItemsStore } from '@/stores/scrollItems'
import { createLogger } from '@/utils/logger'

const logger = createLogger('PauseControl')

/**
 * PAUSE機能制御用のComposable
 * 一時停止状態の管理と位置情報の保存・復元を提供
 */
export interface UsePauseControlReturn {
  isPaused: ComputedRef<boolean>
  pausedPositions: ComputedRef<Map<string, number>>
  pauseTimestamp: ComputedRef<number | null>
  pause: () => void
  resume: () => void
  toggle: () => void
  savePosition: (itemId: string, translateX: number) => void
  getSavedPosition: (itemId: string) => number | undefined
  clearSavedPositions: () => void
  saveAllPositions: (items: Array<{ id: string; translateX: number }>) => void
}

export function usePauseControl(): UsePauseControlReturn {
  const store = useScrollItemsStore()
  
  // Computed refs for reactive state
  const isPaused = computed(() => store.isPaused)
  const pausedPositions = computed(() => store.pausedPositions)
  const pauseTimestamp = computed(() => store.pauseTimestamp)
  
  /**
   * アニメーションを一時停止
   */
  const pause = (): void => {
    if (!store.isPaused) {
      logger.debug('Pausing animation')
      store.setIsPaused(true)
    }
  }
  
  /**
   * アニメーションを再開
   */
  const resume = (): void => {
    if (store.isPaused) {
      logger.debug('Resuming animation')
      store.setIsPaused(false)
    }
  }
  
  /**
   * 一時停止/再開をトグル
   */
  const toggle = (): void => {
    logger.debug(`Toggling pause state from ${String(store.isPaused)} to ${String(!store.isPaused)}`)
    store.togglePause()
  }
  
  /**
   * アイテムの位置を保存
   * @param itemId アイテムID
   * @param translateX X座標のtranslate値
   */
  const savePosition = (itemId: string, translateX: number): void => {
    store.savePausedPosition(itemId, translateX)
    if (import.meta.env.DEV) {
      logger.debug(`Saved position for ${itemId}: ${String(translateX)}`)
    }
  }
  
  /**
   * 保存された位置を取得
   * @param itemId アイテムID
   * @returns 保存されたtranslateX値（ない場合はundefined）
   */
  const getSavedPosition = (itemId: string): number | undefined => {
    return store.getPausedPositionX(itemId)
  }
  
  /**
   * すべての保存位置をクリア
   */
  const clearSavedPositions = (): void => {
    logger.debug('Clearing all saved positions')
    store.clearPausedPositions()
  }
  
  /**
   * 複数アイテムの位置を一括保存
   * @param items アイテムIDと位置のペア配列
   */
  const saveAllPositions = (items: Array<{ id: string; translateX: number }>): void => {
    items.forEach(item => {
      store.savePausedPosition(item.id, item.translateX)
    })
    if (import.meta.env.DEV) {
      logger.debug(`Saved positions for ${String(items.length)} items`)
    }
  }
  
  return {
    // State
    isPaused,
    pausedPositions,
    pauseTimestamp,
    
    // Actions
    pause,
    resume,
    toggle,
    savePosition,
    getSavedPosition,
    clearSavedPositions,
    saveAllPositions
  }
}