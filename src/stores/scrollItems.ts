import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScrollItem } from '@/types/scroll-item'
import { isImageItem, isTextItem } from '@/types/scroll-item'

/**
 * スクロールアイテムの状態管理ストア
 * アイテムのCRUD操作と速度制御を提供
 */
export const useScrollItemsStore = defineStore('scrollItems', () => {
  // State
  const items = ref<ScrollItem[]>([])
  const globalVelocity = ref(100) // グローバル速度（パーセント）
  const itemCount = ref(20) // 表示するアイテム数
  const showTexts = ref(true) // テキストアイテムの表示/非表示
  const boardWidth = ref(0) // ボードの幅
  const boardHeight = ref(0) // ボードの高さ
  
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
  
  const sortedByZIndex = computed(() => 
    [...items.value].sort((a, b) => a.zIndex - b.zIndex)
  )
  
  // Actions
  /**
   * 単一アイテムを追加
   * @param item 追加するアイテム
   */
  function addItem(item: ScrollItem): void {
    items.value.push(item)
  }
  
  /**
   * 複数アイテムを一括追加
   * @param newItems 追加するアイテムの配列
   */
  function addItems(newItems: ScrollItem[]): void {
    items.value.push(...newItems)
  }
  
  /**
   * アイテムを削除
   * @param id 削除するアイテムのID
   */
  function removeItem(id: string): void {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }
  
  /**
   * 複数アイテムを一括削除
   * @param ids 削除するアイテムIDの配列
   */
  function removeItems(ids: string[]): void {
    const idSet = new Set(ids)
    items.value = items.value.filter(item => !idSet.has(item.id))
  }
  
  /**
   * アイテムの位置を更新
   * @param id アイテムID
   * @param position 新しい位置
   */
  function updateItemPosition(id: string, position: { x: number; y: number }): void {
    const item = items.value.find(item => item.id === id)
    if (item !== undefined) {
      item.position = position
    }
  }
  
  /**
   * アイテムの速度を更新
   * @param id アイテムID
   * @param velocity 新しい速度
   */
  function updateItemVelocity(id: string, velocity: number): void {
    const item = items.value.find(item => item.id === id)
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
    const item = items.value.find(item => item.id === id)
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
    const item = items.value.find(item => item.id === id)
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
  }
  
  /**
   * すべてのアイテムを置き換え
   * @param newItems 新しいアイテムの配列
   */
  function setItems(newItems: ScrollItem[]): void {
    items.value = newItems
  }
  
  /**
   * アイテムを最前面に移動
   * @param id アイテムID
   */
  function bringToFront(id: string): void {
    const item = items.value.find(item => item.id === id)
    if (item !== undefined) {
      const maxZ = Math.max(...items.value.map(i => i.zIndex))
      item.zIndex = maxZ + 1
    }
  }
  
  /**
   * IDでアイテムを取得
   * @param id アイテムID
   * @returns アイテム（存在しない場合はundefined）
   */
  function getItemById(id: string): ScrollItem | undefined {
    return items.value.find(item => item.id === id)
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
  interface VelocityService {
    getDefaultVelocity(): number
    calculateItemVelocity(baseVelocity: number, type: string): number
  }
  
  function updateAllVelocities(velocityService: VelocityService): void {
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
    globalVelocity.value = 50
    itemCount.value = 20
    showTexts.value = true
    boardWidth.value = 0
    boardHeight.value = 0
  }
  
  return {
    // State
    items,
    globalVelocity,
    itemCount,
    showTexts,
    boardWidth,
    boardHeight,
    
    // Getters
    imageItems,
    textItems,
    visibleItems,
    itemsCount,
    sortedByZIndex,
    speedMultiplier,
    
    // Actions
    addItem,
    addItems,
    removeItem,
    removeItems,
    updateItem,
    updateItemPosition,
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
    $reset
  }
})