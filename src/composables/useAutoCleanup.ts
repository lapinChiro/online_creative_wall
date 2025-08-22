import { onUnmounted } from 'vue'
import { logger } from '@/utils/logger'

/**
 * 自動クリーンアップ機能
 * コンポーネントのアンマウント時に自動的にリソースを解放
 * メモリリークを防止し、パフォーマンスを維持
 */
interface AutoCleanupReturn {
  registerCleanup: (fn: () => void) => void
  createTimer: (callback: () => void, delay: number) => number
  createInterval: (callback: () => void, delay: number) => number
  addEventListener: (
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) => void
  registerObserver: (
    observer: IntersectionObserver | MutationObserver | ResizeObserver
  ) => void
  clearTimer: (timerId: number) => void
  clearInterval: (intervalId: number) => void
  cleanup: () => void
  getMemoryUsage: () => { timers: number; intervals: number; listeners: number; observers: number }
}

export function useAutoCleanup(): AutoCleanupReturn {
  const cleanupFns: Array<() => void> = []
  const timers: Set<number> = new Set()
  const intervals: Set<number> = new Set()
  const eventListeners: Array<{ target: EventTarget; type: string; handler: EventListener }> = []
  const observers: Set<IntersectionObserver | MutationObserver | ResizeObserver> = new Set()
  
  /**
   * クリーンアップ関数を登録
   * @param fn クリーンアップ時に実行する関数
   */
  const registerCleanup = (fn: () => void): void => {
    cleanupFns.push(fn)
  }
  
  /**
   * タイマーを作成（自動クリーンアップ対象）
   * @param callback タイマーのコールバック
   * @param delay 遅延時間（ms）
   * @returns タイマーID
   */
  const createTimer = (callback: () => void, delay: number): number => {
    const timerId = window.setTimeout(() => {
      callback()
      timers.delete(timerId)
    }, delay)
    timers.add(timerId)
    return timerId
  }
  
  /**
   * インターバルを作成（自動クリーンアップ対象）
   * @param callback インターバルのコールバック
   * @param delay 実行間隔（ms）
   * @returns インターバルID
   */
  const createInterval = (callback: () => void, delay: number): number => {
    const intervalId = window.setInterval(callback, delay)
    intervals.add(intervalId)
    return intervalId
  }
  
  /**
   * イベントリスナーを追加（自動クリーンアップ対象）
   * @param target イベントターゲット
   * @param type イベントタイプ
   * @param handler イベントハンドラ
   * @param options オプション
   */
  const addEventListener = (
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void => {
    target.addEventListener(type, handler, options)
    eventListeners.push({ target, type, handler })
  }
  
  /**
   * Observerを登録（自動クリーンアップ対象）
   * @param observer Observer インスタンス
   */
  const registerObserver = (
    observer: IntersectionObserver | MutationObserver | ResizeObserver
  ): void => {
    observers.add(observer)
  }
  
  /**
   * タイマーをクリア
   * @param timerId タイマーID
   */
  const clearTimer = (timerId: number): void => {
    window.clearTimeout(timerId)
    timers.delete(timerId)
  }
  
  /**
   * インターバルをクリア
   * @param intervalId インターバルID
   */
  const clearInterval = (intervalId: number): void => {
    window.clearInterval(intervalId)
    intervals.delete(intervalId)
  }
  
  /**
   * すべてのリソースをクリーンアップ
   */
  const cleanupAll = (): void => {
    // カスタムクリーンアップ関数を実行
    cleanupFns.forEach(fn => {
      try {
        fn()
      } catch (error) {
        logger.error('Cleanup function error:', error)
      }
    })
    cleanupFns.length = 0
    
    // タイマーをクリア
    timers.forEach(timerId => { window.clearTimeout(timerId); })
    timers.clear()
    
    // インターバルをクリア
    intervals.forEach(intervalId => { window.clearInterval(intervalId); })
    intervals.clear()
    
    // イベントリスナーを削除
    eventListeners.forEach(({ target, type, handler }) => {
      try {
        target.removeEventListener(type, handler)
      } catch (error) {
        logger.error('Event listener removal error:', error)
      }
    })
    eventListeners.length = 0
    
    // Observerを切断
    observers.forEach(observer => {
      try {
        observer.disconnect()
      } catch (error) {
        logger.error('Observer disconnect error:', error)
      }
    })
    observers.clear()
  }
  
  /**
   * 手動でクリーンアップを実行
   */
  const cleanup = cleanupAll
  
  /**
   * コンポーネントのアンマウント時に自動クリーンアップ
   */
  onUnmounted(() => {
    cleanupAll()
  })
  
  /**
   * メモリ使用量を取得（デバッグ用）
   */
  const getMemoryUsage = (): { timers: number; intervals: number; listeners: number; observers: number } => {
    return {
      timers: timers.size,
      intervals: intervals.size,
      listeners: eventListeners.length,
      observers: observers.size
    }
  }
  
  return {
    registerCleanup,
    createTimer,
    createInterval,
    addEventListener,
    registerObserver,
    clearTimer,
    clearInterval,
    cleanup,
    getMemoryUsage
  }
}