import { ref, type Ref } from 'vue'
import domtoimage from 'dom-to-image-more'
import { createLogger } from '@/utils/logger'
import { formatDownloadFilename } from '@/utils/downloadHelper'

const logger = createLogger('useCanvasDownload')

export interface UseCanvasDownloadReturn {
  isCapturing: Ref<boolean>
  captureError: Ref<string | null>
  captureProgress: Ref<number>
  captureBlackboard: (element: HTMLElement) => Promise<void>
  clearError: () => void
}

/**
 * Canvas download composable
 * Single responsibility: DOM capture and download integration
 */
export function useCanvasDownload(): UseCanvasDownloadReturn {
  const isCapturing = ref(false)
  const captureError = ref<string | null>(null)
  const captureProgress = ref(0)
  
  /**
   * Capture DOM element as PNG and trigger download
   * @param element - The DOM element to capture
   */
  const captureBlackboard = async (element: HTMLElement): Promise<void> => {
    try {
      isCapturing.value = true
      captureError.value = null
      captureProgress.value = 0
      
      // Set timeout for 10 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Capture timeout'))
        }, 10000)
      })
      
      // Get the full size of the blackboard including all content
      // Use the larger of scrollWidth/scrollHeight or window dimensions
      const fullWidth = Math.max(
        element.scrollWidth,
        element.offsetWidth,
        window.innerWidth
      )
      const fullHeight = Math.max(
        element.scrollHeight,
        element.offsetHeight,
        window.innerHeight
      )
      
      // Capture with dom-to-image-more (stable and reliable)
      const capturePromise = domtoimage.toPng(element, {
        quality: 1.0, // Maximum quality (REQ-004)
        width: fullWidth * 2, // 2x resolution with full content width
        height: fullHeight * 2, // 2x resolution with full content height
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left'
        },
        bgcolor: '#2a2d3a',
        imagePlaceholder: undefined, // 画像読み込みエラーを防ぐ
        filter: (node: Node) => {
          // 不要な要素を除外
          if (node instanceof Element) {
            // スクロールバーなどを除外
            if (node.classList.contains('scrollbar')) {
              return false
            }
          }
          return true
        }
      })
      
      // Race between capture and timeout
      const dataUrl = await Promise.race([capturePromise, timeoutPromise])
      captureProgress.value = 50
      
      // Convert data URL to blob and download
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = formatDownloadFilename()
      link.click()
      
      // Cleanup after download
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)
      
      captureProgress.value = 100
    } catch (error) {
      // Japanese error messages
      if (error instanceof Error) {
        if (error.message === 'Capture timeout') {
          captureError.value = '処理がタイムアウトしました'
        } else if (error.message === 'PNG generation failed') {
          captureError.value = 'PNG生成に失敗しました'
        } else if (error.message.includes('tainted') || error.message.includes('CORS')) {
          captureError.value = '一部の画像をキャプチャできません'
        } else {
          captureError.value = 'キャプチャに失敗しました'
        }
        logger.error('Capture failed:', error)
      } else {
        captureError.value = 'キャプチャに失敗しました'
      }
    } finally {
      isCapturing.value = false
    }
  }
  
  /**
   * Clear error message
   */
  const clearError = (): void => {
    captureError.value = null
  }
  
  return {
    isCapturing,
    captureError,
    captureProgress,
    captureBlackboard,
    clearError
  }
}