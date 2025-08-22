/**
 * Animation Worker
 * メインスレッドから独立して位置計算を実行
 * CPU負荷を分散し、メインスレッドの負荷を軽減
 */

// メッセージタイプ定義
interface WorkerMessage {
  type: 'init' | 'update' | 'updateBatch' | 'resize'
  data: unknown
}

interface InitMessage extends WorkerMessage {
  type: 'init'
  data: {
    boardWidth: number
    boardHeight: number
    scrollConfig: {
      position: {
        minY: number
        bottomMargin: number
        offscreenOffset: number
        wrapAroundBuffer: number
      }
      sizes: {
        image: Record<string, { width: number; height: number }>
      }
    }
  }
}

interface UpdateMessage extends WorkerMessage {
  type: 'update'
  data: {
    items: Array<{
      id: string
      position: { x: number; y: number }
      velocity: number
      type: 'image' | 'text'
      content: {
        size?: string
        text?: string
        fontSize?: number
      }
    }>
    deltaTime: number
  }
}

interface UpdateBatchMessage extends WorkerMessage {
  type: 'updateBatch'
  data: {
    items: Array<{
      id: string
      position: { x: number; y: number }
      velocity: number
      type: 'image' | 'text'
      content: {
        size?: string
        text?: string
        fontSize?: number
      }
    }>
    deltaTime: number
    batchSize: number
    maxItems: number
  }
}

interface ResizeMessage extends WorkerMessage {
  type: 'resize'
  data: {
    boardWidth: number
    boardHeight: number
  }
}

// ワーカー状態
let boardWidth = 0
let boardHeight = 0
let scrollConfig: InitMessage['data']['scrollConfig'] | null = null

/**
 * ランダム値生成
 */
function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Y座標をランダムに生成
 */
function generateRandomY(): number {
  if (scrollConfig === null) {
    return 0
  }
  const minY = scrollConfig.position.minY
  const maxY = boardHeight - scrollConfig.position.bottomMargin
  return randomRange(minY, maxY)
}

/**
 * アイテムの推定幅を取得
 */
function getItemWidth(item: UpdateMessage['data']['items'][0]): number {
  if (scrollConfig === null) {
    return 200 // デフォルト値
  }
  
  if (item.type === 'image' && item.content.size !== undefined) {
    const size = scrollConfig.sizes.image[item.content.size]
    return size !== undefined ? size.width : 200
  } else if (item.type === 'text' && item.content.text !== undefined && item.content.fontSize !== undefined) {
    // テキストの場合は推定値（フォントサイズ × 文字数基準）
    return Math.min(item.content.text.length * item.content.fontSize * 12, 300)
  }
  return 200 // デフォルト値
}

/**
 * アイテムが画面左端から完全に出たかを判定
 */
function shouldWrapAround(x: number, itemWidth: number): boolean {
  return x < -itemWidth
}

/**
 * ループ時の再配置位置を生成
 */
function getWrapAroundPosition(): { x: number; y: number } {
  if (scrollConfig === null) {
    return { x: boardWidth, y: boardHeight / 2 }
  }
  
  const { offscreenOffset, wrapAroundBuffer } = scrollConfig.position
  const x = boardWidth + offscreenOffset + randomRange(0, wrapAroundBuffer)
  const y = generateRandomY()
  
  return { x, y }
}

/**
 * 単一アイテムの位置更新
 */
function updateItemPosition(
  item: UpdateMessage['data']['items'][0],
  deltaTime: number
): { id: string; position: { x: number; y: number } } {
  const newX = item.position.x - (item.velocity * deltaTime)
  const itemWidth = getItemWidth(item)
  
  if (shouldWrapAround(newX, itemWidth)) {
    // ループ位置を取得
    const newPosition = getWrapAroundPosition()
    return {
      id: item.id,
      position: newPosition
    }
  } else {
    // 通常の位置更新
    return {
      id: item.id,
      position: { x: newX, y: item.position.y }
    }
  }
}

/**
 * バッチで複数アイテムの位置を更新
 */
function updateItemPositionsBatch(
  items: UpdateMessage['data']['items'],
  deltaTime: number,
  batchSize: number,
  maxItems: number
): Array<{ id: string; position: { x: number; y: number } }> {
  const itemsToUpdate = items.slice(0, Math.min(items.length, maxItems))
  const results: Array<{ id: string; position: { x: number; y: number } }> = []
  
  for (let i = 0; i < itemsToUpdate.length; i += batchSize) {
    const batch = itemsToUpdate.slice(i, i + batchSize)
    
    batch.forEach(item => {
      results.push(updateItemPosition(item, deltaTime))
    })
  }
  
  return results
}

/**
 * メッセージハンドラー
 */
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'init': {
      // 初期化
      const initData = data as InitMessage['data']
      boardWidth = initData.boardWidth
      boardHeight = initData.boardHeight
      scrollConfig = initData.scrollConfig
      
      self.postMessage({
        type: 'initComplete',
        data: { success: true }
      })
      break
    }
    
    case 'update': {
      // 単一更新
      const updateData = data as UpdateMessage['data']
      const results = updateData.items.map(item => 
        updateItemPosition(item, updateData.deltaTime)
      )
      
      self.postMessage({
        type: 'updateComplete',
        data: { positions: results }
      })
      break
    }
    
    case 'updateBatch': {
      // バッチ更新
      const batchData = data as UpdateBatchMessage['data']
      const results = updateItemPositionsBatch(
        batchData.items,
        batchData.deltaTime,
        batchData.batchSize,
        batchData.maxItems
      )
      
      self.postMessage({
        type: 'updateComplete',
        data: { positions: results }
      })
      break
    }
    
    case 'resize': {
      // リサイズ
      const resizeData = data as ResizeMessage['data']
      boardWidth = resizeData.boardWidth
      boardHeight = resizeData.boardHeight
      
      self.postMessage({
        type: 'resizeComplete',
        data: { success: true }
      })
      break
    }
    
    default:
      console.warn('[AnimationWorker] Unknown message type:', type)
  }
})

// Worker準備完了を通知
self.postMessage({
  type: 'ready',
  data: {}
})

// TypeScript用のエクスポート（実際には使用されない）
export {}