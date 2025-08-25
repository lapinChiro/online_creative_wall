import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScrollItem } from '@/types/scroll-item'
import { isImageItem, isTextItem } from '@/types/scroll-item'
import { createLogger } from '@/utils/logger'

/**
 * アイテムのメタデータ型定義（将来使用予定）
 */
// interface ItemMetadata {
//   lastUpdated: number
//   updateCount: number
//   isAnimating: boolean
//   renderPriority: number
// }

/**
 * スクロールアイテムの状態管理ストア
 * WeakMapによる効率的なメモリ管理とパフォーマンス最適化
 */
export const useScrollItemsStore = defineStore('scrollItems', () => {
  const logger = createLogger('ScrollItemsStore')
  // State（最適化版）
  // const itemsSet = ref(new Set<ScrollItem>()) // Set使用で重複排除（将来使用予定）
  const items = ref<ScrollItem[]>([]) // 通常のrefに戻す（互換性のため）
  const itemsMap = ref<Map<string, ScrollItem>>(new Map()) // 高速ルックアップ用Map
  
  // WeakMapによるメタデータ管理（自動GC対象）
  // const itemsMetadata = new WeakMap<ScrollItem, ItemMetadata>() // 将来使用予定
  
  const globalVelocity = ref(100) // グローバル速度（パーセント）
  const itemCount = ref(20) // 表示するアイテム数
  const showTexts = ref(true) // テキストアイテムの表示/非表示
  const boardWidth = ref(0) // ボードの幅
  const boardHeight = ref(0) // ボードの高さ
  
  // PAUSE機能の状態
  const isPaused = ref(false) // 一時停止状態
  const pausedPositions = ref(new Map<string, number>()) // itemId → translateX値のマップ
  const pauseTimestamp = ref<number | null>(null) // 一時停止した時刻
  
  // Getters
  const imageItems = computed(() => 
    items.value.filter(isImageItem)
  )
  
  const textItems = computed(() => 
    items.value.filter(isTextItem)
  )
  
  // 互換性のためのエイリアス
  const speedMultiplier = computed(() => globalVelocity.value / 100)
  
  const visibleItems = computed(() => {
    const result = showTexts.value 
      ? items.value.slice(0, itemCount.value)
      : imageItems.value.slice(0, itemCount.value)
    
    return result
  })
  
  const itemsCount = computed(() => ({
    total: items.value.length,
    images: imageItems.value.length,
    texts: textItems.value.length
  }))
  
  
  // Actions
  /**
   * 単一アイテムを追加
   * @param item 追加するアイテム
   */
  function addItem(item: ScrollItem): void {
    items.value.push(item)
    itemsMap.value.set(item.id, item)
  }
  
  /**
   * 複数アイテムを一括追加
   * @param newItems 追加するアイテムの配列
   */
  function addItems(newItems: ScrollItem[]): void {
    items.value.push(...newItems)
    newItems.forEach(item => itemsMap.value.set(item.id, item))
  }
  
  /**
   * アイテムを削除
   * @param id 削除するアイテムのID
   */
  function removeItem(id: string): void {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
      itemsMap.value.delete(id)
      // R-002対策: メモリリーク防止のため、pausedPositionsからも削除
      pausedPositions.value.delete(id)
    }
  }
  
  /**
   * 複数アイテムを一括削除
   * @param ids 削除するアイテムIDの配列
   */
  function removeItems(ids: string[]): void {
    const idSet = new Set(ids)
    items.value = items.value.filter(item => !idSet.has(item.id))
    ids.forEach(id => {
      itemsMap.value.delete(id)
      // R-002対策: メモリリーク防止のため、pausedPositionsからも削除
      pausedPositions.value.delete(id)
    })
  }
  
  /**
   * アイテムの位置を更新
   * @param id アイテムID
   * @param position 新しい位置
   */
  function updateItemPosition(id: string, position: { x: number; y: number }): void {
    const item = itemsMap.value.get(id)
    if (item !== undefined) {
      item.position = position
    }
  }
  
  /**
   * アイテムの位置を直接更新（オブジェクト生成を回避）
   * @param id アイテムID
   * @param x X座標
   * @param y Y座標
   */
  function updateItemPositionDirect(id: string, x: number, y: number): void {
    const item = itemsMap.value.get(id)
    if (item !== undefined) {
      // 直接プロパティを更新（オブジェクト生成なし）
      item.position.x = x
      item.position.y = y
    }
  }
  
  /**
   * アイテムの速度を更新
   * @param id アイテムID
   * @param velocity 新しい速度
   */
  function updateItemVelocity(id: string, velocity: number): void {
    const item = itemsMap.value.get(id)
    if (item !== undefined) {
      item.velocity = velocity
    }
  }
  
  /**
   * アイテムのz-indexを更新
   * @param id アイテムID
   * @param zIndex 新しいz-index
   */
  function updateItemZIndex(id: string, zIndex: number): void {
    const item = itemsMap.value.get(id)
    if (item !== undefined) {
      item.zIndex = zIndex
    }
  }
  
  /**
   * グローバル速度を更新
   * @param velocity 新しい速度（パーセント）
   */
  function updateGlobalVelocity(velocity: number): void {
    globalVelocity.value = Math.max(10, Math.min(150, velocity))
  }
  
  /**
   * スピード倍率を設定（互換性のため）
   * @param multiplier 倍率
   */
  function setSpeedMultiplier(multiplier: number): void {
    globalVelocity.value = multiplier * 100
  }
  
  /**
   * ボードのサイズを設定
   * @param width 幅
   * @param height 高さ
   */
  function setBoardDimensions(width: number, height: number): void {
    boardWidth.value = width
    boardHeight.value = height
  }
  
  /**
   * アイテムを更新（汎用）
   * @param id アイテムID
   * @param updates 更新内容
   */
  function updateItem(id: string, updates: Partial<ScrollItem>): void {
    const item = itemsMap.value.get(id)
    if (item !== undefined) {
      Object.assign(item, updates)
    }
  }
  
  /**
   * 表示アイテム数を更新
   * @param count 新しいアイテム数
   */
  function updateItemCount(count: number): void {
    itemCount.value = Math.max(1, count)
  }
  
  /**
   * テキスト表示を切り替え
   */
  function toggleTexts(): void {
    showTexts.value = !showTexts.value
  }
  
  /**
   * テキスト表示状態を設定
   * @param show 表示するかどうか
   */
  function setShowTexts(show: boolean): void {
    showTexts.value = show
  }
  
  /**
   * すべてのアイテムをクリア
   */
  function clearItems(): void {
    items.value = []
    itemsMap.value.clear()
    // R-002対策: メモリリーク防止のため、pausedPositionsもクリア
    pausedPositions.value.clear()
  }
  
  /**
   * すべてのアイテムを置き換え
   * @param newItems 新しいアイテムの配列
   */
  function setItems(newItems: ScrollItem[]): void {
    items.value = newItems
    itemsMap.value.clear()
    newItems.forEach(item => itemsMap.value.set(item.id, item))
  }
  
  /**
   * アイテムを最前面に移動（パフォーマンス最適化済）
   * @param id アイテムID
   */
  function bringToFront(id: string): void {
    const item = itemsMap.value.get(id)
    if (item !== undefined) {
      // 線形検索ではなくreduceで最大値を求める
      const maxZ = items.value.reduce((max, current) => Math.max(max, current.zIndex), 0)
      item.zIndex = maxZ + 1
    }
  }
  
  /**
   * IDでアイテムを取得
   * @param id アイテムID
   * @returns アイテム（存在しない場合はundefined）
   */
  function getItemById(id: string): ScrollItem | undefined {
    return itemsMap.value.get(id)
  }
  
  /**
   * タイプ別にアイテムを取得
   * @param type アイテムタイプ
   * @returns 該当タイプのアイテム配列
   */
  function getItemsByType(type: 'image' | 'text'): ScrollItem[] {
    return items.value.filter(item => item.type === type)
  }
  
  /**
   * すべてのアイテムの速度を更新
   * @param velocityService VelocityServiceインスタンス
   */
  function updateAllVelocities(velocityService: {
    getDefaultVelocity(): number
    calculateItemVelocity(baseVelocity: number, type: string): number
  }): void {
    const baseVelocity = velocityService.getDefaultVelocity()
    items.value.forEach(item => {
      item.velocity = velocityService.calculateItemVelocity(baseVelocity, item.type)
    })
  }
  
  /**
   * ストアをリセット
   */
  function $reset(): void {
    items.value = []
    itemsMap.value.clear()
    globalVelocity.value = 50
    itemCount.value = 20
    showTexts.value = true
    boardWidth.value = 0
    boardHeight.value = 0
    isPaused.value = false
    pausedPositions.value.clear()
    pauseTimestamp.value = null
  }
  
  // PAUSE機能のアクション
  /**
   * 一時停止状態を設定
   * @param value 一時停止するかどうか
   */
  function setIsPaused(value: boolean): void {
    const startTime = performance.now()
    isPaused.value = value
    if (value) {
      pauseTimestamp.value = Date.now()
      if (import.meta.env.DEV) {
        const elapsed = performance.now() - startTime
        logger.debug(`[PAUSE Performance] Pause operation completed in ${elapsed.toFixed(2)}ms`)
      }
    } else {
      pauseTimestamp.value = null
      clearPausedPositions()
      if (import.meta.env.DEV) {
        const elapsed = performance.now() - startTime
        logger.debug(`[PAUSE Performance] Resume operation completed in ${elapsed.toFixed(2)}ms`)
      }
    }
  }
  
  /**
   * 一時停止状態をトグル
   */
  function togglePause(): void {
    setIsPaused(!isPaused.value)
  }
  
  /**
   * アイテムの一時停止位置を保存
   * @param itemId アイテムID
   * @param translateX X座標のtranslate値
   */
  function savePausedPosition(itemId: string, translateX: number): void {
    pausedPositions.value.set(itemId, translateX)
  }
  
  /**
   * アイテムの一時停止位置を取得
   * @param itemId アイテムID
   * @returns 保存されているtranslateX値（ない場合はundefined）
   */
  function getPausedPositionX(itemId: string): number | undefined {
    return pausedPositions.value.get(itemId)
  }
  
  /**
   * すべての一時停止位置をクリア
   */
  function clearPausedPositions(): void {
    pausedPositions.value.clear()
  }
  
  return {
    // State
    items,
    globalVelocity,
    itemCount,
    showTexts,
    boardWidth,
    boardHeight,
    isPaused,
    pausedPositions,
    pauseTimestamp,
    
    // Getters
    imageItems,
    textItems,
    visibleItems,
    itemsCount,
    speedMultiplier,
    
    // Actions
    addItem,
    addItems,
    removeItem,
    removeItems,
    updateItem,
    updateItemPosition,
    updateItemPositionDirect,
    updateItemVelocity,
    updateItemZIndex,
    updateGlobalVelocity,
    setSpeedMultiplier,
    setBoardDimensions,
    updateItemCount,
    toggleTexts,
    setShowTexts,
    clearItems,
    setItems,
    bringToFront,
    getItemById,
    getItemsByType,
    updateAllVelocities,
    $reset,
    
    // PAUSE Actions
    setIsPaused,
    togglePause,
    savePausedPosition,
    getPausedPositionX,
    clearPausedPositions
  }
})