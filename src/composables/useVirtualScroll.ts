import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { ScrollItem } from '@/types/scroll-item'
import { logger } from '@/utils/logger'

interface RenderingStats {
  totalItems: number
  virtualItems: number
  visibleItems: number
  reductionRate: number
}

interface VirtualScrollReturn {
  virtualItems: Ref<ScrollItem[]>
  visibleIds: Ref<Set<string>>
  viewportItemIds: Ref<Set<string>>
  observeItem: (el: Element | null) => void
  unobserveItem: (el: Element | null) => void
  unobserveAll: () => void
  getRenderingStats: () => RenderingStats
}

/**
 * Virtual Scrolling実装
 * ビューポート内とその周辺のアイテムのみをレンダリング
 * Intersection Observerを使用した効率的な可視性管理
 */
export function useVirtualScroll(items: Ref<ScrollItem[]>): VirtualScrollReturn {
  const visibleIds = ref(new Set<string>())
  const observer = ref<IntersectionObserver | null>(null)
  
  // ビューポート内のアイテムIDを管理
  const viewportItemIds = ref(new Set<string>())
  
  /**
   * Virtual Items: ビューポート内 + バッファゾーンのアイテムのみ
   * バッファゾーン: 左右200pxの余裕を持たせて、スムーズなスクロール体験を提供
   */
  const virtualItems = computed(() => {
    const bufferZone = 200 // px
    const viewportWidth = window.innerWidth
    
    return items.value.filter(item => {
      // 位置ベースのフィルタリング（高速）
      const inHorizontalRange = 
        item.position.x > -bufferZone && 
        item.position.x < viewportWidth + bufferZone
      
      // Intersection Observerによる詳細な可視性チェック
      const isVisible = visibleIds.value.has(item.id)
      
      // どちらかの条件を満たせば表示
      return inHorizontalRange || isVisible
    })
  })
  
  /**
   * レンダリング統計情報を取得
   */
  const getRenderingStats = (): RenderingStats => ({
    totalItems: items.value.length,
    virtualItems: virtualItems.value.length,
    visibleItems: visibleIds.value.size,
    reductionRate: items.value.length > 0 
      ? Math.round((1 - virtualItems.value.length / items.value.length) * 100)
      : 0
  })
  
  /**
   * Intersection Observer初期化
   * rootMargin: ビューポート外100pxまでを監視範囲に含める
   */
  onMounted(() => {
    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-item-id')
          if (id !== null && id !== '') {
            if (entry.isIntersecting) {
              visibleIds.value.add(id)
              viewportItemIds.value.add(id)
            } else {
              visibleIds.value.delete(id)
              viewportItemIds.value.delete(id)
            }
          }
        })
      },
      {
        root: null, // viewport基準
        rootMargin: '100px', // ビューポート外100pxまで含める
        threshold: 0 // 1pxでも見えたら検知
      }
    )
    
    // デバッグ用: 統計情報を定期出力（開発環境のみ）
    if (import.meta.env.DEV) {
      const intervalId = setInterval(() => {
        const stats = getRenderingStats()
        if (stats.totalItems > 0) {
          logger.debug('[VirtualScroll Stats]', {
            total: stats.totalItems,
            virtual: stats.virtualItems,
            visible: stats.visibleItems,
            reduction: `${String(stats.reductionRate)}%`
          })
        }
      }, 5000)
      
      // クリーンアップ時にインターバルもクリア
      onUnmounted(() => { clearInterval(intervalId); })
    }
  })
  
  /**
   * 要素をObserverに登録
   * @param el 監視対象のDOM要素
   */
  const observeItem = (el: Element | null): void => {
    if (el !== null && observer.value !== null) {
      observer.value.observe(el)
    }
  }
  
  /**
   * 要素をObserverから登録解除
   * @param el 監視解除するDOM要素
   */
  const unobserveItem = (el: Element | null): void => {
    if (el !== null && observer.value !== null) {
      observer.value.unobserve(el)
    }
  }
  
  /**
   * すべての要素の監視を解除
   */
  const unobserveAll = (): void => {
    if (observer.value !== null) {
      observer.value.disconnect()
    }
  }
  
  /**
   * クリーンアップ処理
   */
  onUnmounted(() => {
    unobserveAll()
    observer.value = null
    visibleIds.value.clear()
    viewportItemIds.value.clear()
  })
  
  return {
    virtualItems,
    visibleIds,
    viewportItemIds,
    observeItem,
    unobserveItem,
    unobserveAll,
    getRenderingStats
  }
}