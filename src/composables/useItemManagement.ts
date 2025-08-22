import { ref } from 'vue'
import { useScrollItemsStore } from '@/stores/scrollItems'
import { ScrollItemFactory } from '@/factories/ScrollItemFactory'
import { ContentFactory } from '@/factories/ContentFactory'
import { PositionService } from '@/services/PositionService'
import { VelocityService } from '@/services/VelocityService'

/**
 * スクロールアイテムの管理を行うComposable
 * ファクトリーとストアを連携させてアイテムのライフサイクルを管理
 */
export function useItemManagement() {
  const store = useScrollItemsStore()
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Services and factories
  let positionService: PositionService | null = null
  let velocityService: VelocityService | null = null
  let contentFactory: ContentFactory | null = null
  let itemFactory: ScrollItemFactory | null = null

  /**
   * サービスとファクトリーの初期化
   * @param boardWidth ボードの幅
   * @param boardHeight ボードの高さ
   */
  const initializeServices = (
    boardWidth: number = window.innerWidth - 60,
    boardHeight: number = window.innerHeight - 120
  ) => {
    try {
      positionService = new PositionService(boardWidth, boardHeight)
      velocityService = new VelocityService()
      contentFactory = new ContentFactory()
      itemFactory = new ScrollItemFactory(
        positionService,
        velocityService,
        contentFactory
      )
      isInitialized.value = true
    } catch (err) {
      error.value = 'Failed to initialize services'
      console.error('Service initialization error:', err)
    }
  }

  /**
   * 画像アイテムを追加
   * @param imageData 画像データの配列
   * @param startIndex 開始インデックス
   */
  const addImageItems = async (
    imageData: Array<{ url: string; title?: string }>,
    startIndex: number = 0
  ) => {
    if (!itemFactory || !velocityService) {
      throw new Error('Services not initialized')
    }

    const baseVelocity = velocityService.getDefaultVelocity()
    const items = itemFactory.createImageBatch(imageData, startIndex, baseVelocity)
    store.addItems(items)
    return items
  }

  /**
   * テキストアイテムを追加
   * @param texts テキストの配列
   * @param startIndex 開始インデックス
   */
  const addTextItems = async (
    texts: string[],
    startIndex: number = 0
  ) => {
    if (!itemFactory || !velocityService) {
      throw new Error('Services not initialized')
    }

    const baseVelocity = velocityService.getDefaultVelocity()
    const items = itemFactory.createTextBatch(texts, startIndex, baseVelocity)
    store.addItems(items)
    return items
  }

  /**
   * 混合アイテムをバッチで追加
   * @param mixedItems 画像とテキストの混合配列
   * @param startIndex 開始インデックス
   */
  const addMixedItems = async (
    mixedItems: Array<{ type: 'image' | 'text'; data: any }>,
    startIndex: number = 0
  ) => {
    if (!itemFactory || !velocityService) {
      throw new Error('Services not initialized')
    }

    const baseVelocity = velocityService.getDefaultVelocity()
    const items = itemFactory.createBatch(mixedItems, startIndex, baseVelocity)
    store.addItems(items)
    return items
  }

  /**
   * アイテムを削除
   * @param ids 削除するアイテムのID配列
   */
  const removeItems = (ids: string[]): void => {
    store.removeItems(ids)
  }

  /**
   * 単一アイテムを削除
   * @param id 削除するアイテムのID
   */
  const removeItem = (id: string): void => {
    store.removeItem(id)
  }

  /**
   * 全アイテムをクリア
   */
  const clearAllItems = (): void => {
    store.clearItems()
  }

  /**
   * アイテムを最前面に移動
   * @param id アイテムID
   */
  const bringItemToFront = (id: string): void => {
    store.bringToFront(id)
  }

  /**
   * グローバル速度を更新
   * @param speedPercentage 速度のパーセンテージ（10-150）
   */
  const updateGlobalSpeed = (speedPercentage: number): void => {
    if (!velocityService) {
      throw new Error('VelocityService not initialized')
    }

    velocityService.setGlobalMultiplier(speedPercentage)
    store.updateGlobalVelocity(speedPercentage)
    
    // 既存アイテムの速度を更新
    if (store.items.length > 0) {
      store.updateAllVelocities(velocityService)
    }
  }

  /**
   * 表示アイテム数を更新
   * @param count 表示するアイテム数
   */
  const updateItemCount = (count: number): void => {
    store.updateItemCount(count)
  }

  /**
   * テキスト表示を切り替え
   */
  const toggleTextVisibility = (): void => {
    store.toggleTexts()
  }

  /**
   * データをフェッチして初期アイテムを生成
   * @param dataUrl データのURL
   * @param options オプション設定
   */
  const fetchAndGenerateItems = async (
    dataUrl: string,
    options: {
      maxImages?: number
      maxTexts?: number
      shuffle?: boolean
    } = {}
  ) => {
    const { maxImages = 20, maxTexts = 15, shuffle = true } = options
    
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(dataUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${String(response.status)}`)
      }

      interface MediaData {
        media_url_https?: string
        text?: string
      }
      
      const data = await response.json() as MediaData[]
      
      // 画像データを抽出
      const imageData = data
        .filter((item): item is MediaData & { media_url_https: string } => 
          item.media_url_https !== undefined && item.media_url_https !== null)
        .slice(0, maxImages)
        .map((item) => ({
          url: item.media_url_https,
          title: item.text ?? 'Creative Wall Image'
        }))

      // テキストデータを抽出
      const textData = data
        .filter((item): item is MediaData & { text: string } => 
          item.text !== undefined && item.text !== null && item.text.length > 0)
        .map((item) => item.text)
        .slice(0, maxTexts)

      // 混合アイテムリストを作成
      interface MixedItem { type: 'image' | 'text'; data: { url: string; title: string } | string }
      const mixedItems: MixedItem[] = []
      
      imageData.forEach((img) => {
        mixedItems.push({ type: 'image', data: img })
      })

      textData.forEach((text: string) => {
        if (Math.random() > 0.3) { // 70%の確率で追加
          mixedItems.push({ type: 'text', data: text })
        }
      })

      // シャッフル
      if (shuffle) {
        for (let i = mixedItems.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const temp = mixedItems[j]
          const currentItem = mixedItems[i]
          if (temp !== undefined && currentItem !== undefined) {
            mixedItems[j] = currentItem
            mixedItems[i] = temp
          }
        }
      }

      // アイテムを追加
      await addMixedItems(mixedItems, 0)

      return {
        imageCount: imageData.length,
        textCount: textData.length,
        totalCount: mixedItems.length
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch data'
      console.error('Fetch error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * ボード寸法の更新を処理
   * @param width 新しい幅
   * @param height 新しい高さ
   */
  const updateBoardDimensions = (width: number, height: number): void => {
    if (positionService) {
      positionService.updateBoardDimensions(width, height)
    }
  }

  /**
   * パフォーマンス統計を取得
   */
  const getStats = (): { totalItems: number; visibleItems: number; imageItems: number; textItems: number; showTexts: boolean; globalSpeed: number; isInitialized: boolean; isLoading: boolean; error: string | null } => {
    return {
      totalItems: store.items.length,
      visibleItems: store.visibleItems.length,
      imageItems: store.imageItems.length,
      textItems: store.textItems.length,
      globalSpeed: store.globalVelocity,
      showTexts: store.showTexts,
      isInitialized: isInitialized.value,
      isLoading: isLoading.value,
      error: error.value
    }
  }

  /**
   * クリーンアップ
   */
  const cleanup = (): void => {
    clearAllItems()
    positionService = null
    velocityService = null
    contentFactory = null
    itemFactory = null
    isInitialized.value = false
  }

  // ライフサイクル
  // NOTE: このComposableを使用する場合は、呼び出し側のコンポーネントで
  // onMountedとonUnmountedでinitializeとcleanupを呼ぶ必要があります
  // onMounted(() => {
  //   if (!isInitialized.value) {
  //     initializeServices()
  //   }
  //   window.addEventListener('resize', handleResize)
  // })

  // onUnmounted(() => {
  //   window.removeEventListener('resize', handleResize)
  //   cleanup()
  // })

  return {
    // State
    isInitialized,
    isLoading,
    error,
    
    // Initialization
    initializeServices,
    
    // Item management
    addImageItems,
    addTextItems,
    addMixedItems,
    removeItems,
    removeItem,
    clearAllItems,
    bringItemToFront,
    
    // Controls
    updateGlobalSpeed,
    updateItemCount,
    toggleTextVisibility,
    
    // Data fetching
    fetchAndGenerateItems,
    
    // Board management
    updateBoardDimensions,
    
    // Stats and cleanup
    getStats,
    cleanup
  }
}