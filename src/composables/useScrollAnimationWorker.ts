import { ref, type Ref } from 'vue'
import { type PositionService } from '@/services/PositionService'
import { useScrollItemsStore } from '@/stores/scrollItems'
import { calculateBoardSize, SCROLL_CONFIG } from '@/config/scroll.config'
import { createLogger } from '@/utils/logger'

const logger = createLogger('AnimationWorker')

/**
 * Web Workerを使用したスクロールアニメーションを管理するComposable
 * メインスレッドの負荷を軽減し、位置計算を別スレッドで実行
 */
interface UseScrollAnimationWorkerReturn {
  isRunning: Ref<boolean>
  fps: Ref<number>
  start: () => void
  stop: () => void
  toggle: () => void
  getPerformanceInfo: () => { 
    fps: number
    isRunning: boolean
    itemCount: number
    workerStatus: string
  }
  handleResize: () => void
  isWorkerSupported: Ref<boolean>
}

export function useScrollAnimationWorker(
  positionService: PositionService | null = null
): UseScrollAnimationWorkerReturn {
  const store = useScrollItemsStore()
  const isRunning = ref(false)
  const fps = ref(0)
  const isWorkerSupported = ref(false)
  const workerStatus = ref('initializing')
  
  let animationFrameId: number | null = null
  let lastTime = performance.now()
  let frameCount = 0
  let lastFpsUpdate = performance.now()
  let worker: Worker | null = null
  let pendingUpdate = false
  
  /**
   * Workerの初期化
   */
  const initWorker = (): void => {
    try {
      // Web Worker対応確認
      if (typeof Worker === 'undefined') {
        logger.warn('Web Workers not supported')
        workerStatus.value = 'unsupported'
        return
      }
      
      // Worker作成
      worker = new Worker(
        new URL('../workers/animation.worker.ts', import.meta.url),
        { type: 'module' }
      )
      
      // メッセージハンドラー設定
      worker.addEventListener('message', handleWorkerMessage)
      
      // エラーハンドラー設定
      worker.addEventListener('error', (error) => {
        logger.error('Error:', error)
        workerStatus.value = 'error'
      })
      
      // Worker初期化
      const boardSize = calculateBoardSize()
      worker.postMessage({
        type: 'init',
        data: {
          boardWidth: boardSize.width,
          boardHeight: boardSize.height,
          scrollConfig: {
            position: {
              minY: SCROLL_CONFIG.position.minY,
              bottomMargin: SCROLL_CONFIG.position.bottomMargin,
              offscreenOffset: SCROLL_CONFIG.position.offscreenOffset,
              wrapAroundBuffer: SCROLL_CONFIG.position.wrapAroundBuffer
            },
            sizes: {
              image: SCROLL_CONFIG.sizes.image
            }
          }
        }
      })
      
      isWorkerSupported.value = true
      workerStatus.value = 'ready'
      
    } catch (error) {
      logger.error('Failed to initialize:', error)
      workerStatus.value = 'error'
    }
  }
  
  /**
   * Workerからのメッセージハンドラー
   */
  const handleWorkerMessage = (event: MessageEvent): void => {
    const { type, data } = event.data
    
    switch (type) {
      case 'ready':
        if (import.meta.env.DEV) {
          logger.debug('Worker ready')
        }
        break
        
      case 'initComplete':
        if (import.meta.env.DEV) {
          logger.debug('Initialization complete')
        }
        workerStatus.value = 'ready'
        break
        
      case 'updateComplete':
        // 位置更新結果を反映
        if (data.positions !== undefined && Array.isArray(data.positions)) {
          data.positions.forEach((item: { id: string; position: { x: number; y: number } }) => {
            store.updateItemPositionDirect(item.id, item.position.x, item.position.y)
          })
        }
        pendingUpdate = false
        break
        
      case 'resizeComplete':
        if (import.meta.env.DEV) {
          logger.debug('Resize complete')
        }
        break
        
      default:
        logger.warn('Unknown message type:', type)
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
    
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1)
    lastTime = currentTime
    
    // FPS更新
    updateFps(currentTime)
    
    // Worker使用可能かつ前回の更新が完了している場合のみ処理
    if (worker !== null && !pendingUpdate && workerStatus.value === 'ready') {
      const visibleItems = store.visibleItems
      
      if (visibleItems.length > 0) {
        pendingUpdate = true
        
        // Workerに位置計算を依頼
        worker.postMessage({
          type: 'updateBatch',
          data: {
            items: visibleItems.map(item => ({
              id: item.id,
              position: { x: item.position.x, y: item.position.y },
              velocity: item.velocity,
              type: item.type,
              content: item.content
            })),
            deltaTime,
            batchSize: SCROLL_CONFIG.animation.batchSize,
            maxItems: SCROLL_CONFIG.performance.maxConcurrentAnimations
          }
        })
      }
    }
    
    animationFrameId = requestAnimationFrame(animate)
  }
  
  /**
   * アニメーション開始
   */
  const start = (): void => {
    if (!isRunning.value) {
      // Workerが未初期化の場合は初期化
      if (worker === null) {
        initWorker()
      }
      
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
  const getPerformanceInfo = (): { 
    fps: number
    isRunning: boolean
    itemCount: number
    workerStatus: string
  } => {
    return {
      fps: fps.value,
      isRunning: isRunning.value,
      itemCount: store.visibleItems.length,
      workerStatus: workerStatus.value
    }
  }
  
  /**
   * ボード寸法の更新を処理
   */
  const handleResize = (): void => {
    const newBoardSize = calculateBoardSize()
    
    // PositionServiceを更新
    if (positionService !== null) {
      positionService.updateBoardDimensions(newBoardSize.width, newBoardSize.height)
    }
    
    // Workerにもリサイズを通知
    if (worker !== null && workerStatus.value === 'ready') {
      worker.postMessage({
        type: 'resize',
        data: {
          boardWidth: newBoardSize.width,
          boardHeight: newBoardSize.height
        }
      })
    }
  }
  
  // クリーンアップ
  const cleanup = (): void => {
    stop()
    if (worker !== null) {
      worker.terminate()
      worker = null
    }
  }
  
  // 初期化
  initWorker()
  
  // クリーンアップ登録（Vue 3のunmounted時に自動実行）
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', cleanup)
  }
  
  return {
    isRunning,
    fps,
    start,
    stop,
    toggle,
    getPerformanceInfo,
    handleResize,
    isWorkerSupported
  }
}