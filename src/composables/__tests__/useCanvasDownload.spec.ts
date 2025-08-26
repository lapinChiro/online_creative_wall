import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
// Will fail initially - file does not exist yet (RED phase)
import { useCanvasDownload } from '../useCanvasDownload'

// Mock dom-to-image-more module
vi.mock('dom-to-image-more', () => ({
  default: {
    toPng: vi.fn()
  }
}))

// Mock logger
vi.mock('@/utils/logger', () => ({
  createLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }))
}))

// Mock downloadHelper
vi.mock('@/utils/downloadHelper', () => ({
  formatDownloadFilename: vi.fn(() => 'creative-wall-20250826-120000.png')
}))

describe('useCanvasDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should return correct interface', () => {
      const { 
        isCapturing, 
        captureError, 
        captureProgress, 
        captureBlackboard, 
        clearError 
      } = useCanvasDownload()
      
      expect(isCapturing.value).toBe(false)
      expect(captureError.value).toBeNull()
      expect(captureProgress.value).toBe(0)
      expect(typeof captureBlackboard).toBe('function')
      expect(typeof clearError).toBe('function')
    })
  })
  
  describe('captureBlackboard', () => {
    it('should handle 10-second timeout', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      
      // Setup mock to delay forever
      domtoimage.toPng.mockImplementation(
        () => new Promise(() => {/* never resolves */})
      )
      
      const { captureBlackboard, captureError } = useCanvasDownload()
      const element = document.createElement('div')
      
      // Start capture with timeout
      const capturePromise = captureBlackboard(element)
      
      // Fast-forward 10 seconds
      await vi.advanceTimersByTimeAsync(10000)
      
      await capturePromise
      expect(captureError.value).toBe('処理がタイムアウトしました')
    })
    
    it('should use quality 1.0 for PNG generation', async () => {
      const mockDataUrl = 'data:image/png;base64,test'
      
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      domtoimage.toPng.mockResolvedValue(mockDataUrl)
      
      const { captureBlackboard } = useCanvasDownload()
      const element = document.createElement('div')
      
      await captureBlackboard(element)
      
      // Check toPng was called with quality 1.0
      expect(domtoimage.toPng).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          quality: 1.0
        })
      )
    })
    
    it('should cleanup object URLs', async () => {
      const mockDataUrl = 'data:image/png;base64,test'
      
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      domtoimage.toPng.mockResolvedValue(mockDataUrl)
      
      // Mock URL methods
      const mockUrl = 'blob:http://example.com/123'
      
      // Store original methods
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const originalCreateObjectURL = URL.createObjectURL
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const originalRevokeObjectURL = URL.revokeObjectURL
      
      const mockRevokeObjectURL = vi.fn()
      URL.createObjectURL = vi.fn(() => mockUrl)
      URL.revokeObjectURL = mockRevokeObjectURL
      
      const { captureBlackboard } = useCanvasDownload()
      const element = document.createElement('div')
      
      await captureBlackboard(element)
      
      // Wait for cleanup timeout
      await vi.advanceTimersByTimeAsync(100)
      
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(mockUrl)
      
      // Restore original methods
      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
    })
    
    it('should handle PNG generation failure', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      domtoimage.toPng.mockRejectedValue(new Error('PNG generation failed'))
      
      const { captureBlackboard, captureError } = useCanvasDownload()
      const element = document.createElement('div')
      
      await captureBlackboard(element)
      
      expect(captureError.value).toBe('PNG生成に失敗しました')
    })
    
    it('should display Japanese error messages', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      domtoimage.toPng.mockRejectedValue(new Error('Canvas tainted'))
      
      const { captureBlackboard, captureError } = useCanvasDownload()
      const element = document.createElement('div')
      
      await captureBlackboard(element)
      
      expect(captureError.value).toMatch(/一部の画像をキャプチャできません|キャプチャに失敗しました/)
    })
  })
  
  describe('clearError', () => {
    it('should clear error message', () => {
      const { captureError, clearError } = useCanvasDownload()
      
      // Set an error
      captureError.value = 'Test error'
      expect(captureError.value).toBe('Test error')
      
      // Clear the error
      clearError()
      expect(captureError.value).toBeNull()
    })
  })
  
  describe('progress tracking', () => {
    it('should update progress during capture', async () => {
      const mockDataUrl = 'data:image/png;base64,test'
      
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      domtoimage.toPng.mockResolvedValue(mockDataUrl)
      
      const { captureBlackboard, captureProgress } = useCanvasDownload()
      const element = document.createElement('div')
      
      expect(captureProgress.value).toBe(0)
      
      const capturePromise = captureBlackboard(element)
      
      // Progress should be set during capture
      await capturePromise
      
      // Progress should reach 100 after completion
      expect(captureProgress.value).toBeGreaterThan(0)
    })
  })
})