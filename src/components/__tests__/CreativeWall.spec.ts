import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CreativeWall from '../CreativeWall.vue'
import { useScrollItemsStore } from '@/stores/scrollItems'
import { nextTick } from 'vue'

// Mock dom-to-image-more
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

// Mock DataService
vi.mock('@/services/DataService', () => ({
  DataService: class {
    fetchMediaData = vi.fn().mockResolvedValue({
      images: [
        { url: 'test1.jpg', title: 'Test 1', size: 'medium' },
        { url: 'test2.jpg', title: 'Test 2', size: 'large' }
      ],
      texts: ['Test text 1', 'Test text 2']
    })
  }
}))

// Mock animation composables
vi.mock('@/composables/useScrollAnimation', () => ({
  useScrollAnimation: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    handleResize: vi.fn()
  })
}))

vi.mock('@/composables/useScrollAnimationWorker', () => ({
  useScrollAnimationWorker: () => ({
    start: vi.fn(),
    stop: vi.fn(),
    handleResize: vi.fn()
  })
}))

// Mock environment variables
vi.stubEnv('VITE_MEDIA_DATA_URL', 'https://test.s3.amazonaws.com/data.json')

describe('CreativeWall - Download Feature Integration', () => {
  let wrapper: ReturnType<typeof mount>
  
  beforeEach(async () => {
    // Setup Pinia
    setActivePinia(createPinia())
    
    // Mock document.querySelector for blackboard element
    const mockBlackboard = document.createElement('div')
    mockBlackboard.className = 'blackboard'
    vi.spyOn(document, 'querySelector').mockImplementation((selector) => {
      if (selector === '.blackboard') {
        return mockBlackboard
      }
      return null
    })
    
    // Setup fake timers
    vi.useFakeTimers()
    
    // Mount component
    wrapper = mount(CreativeWall, {
      global: {
        stubs: {
          BlackBoard: {
            template: '<div class="blackboard"></div>'
          }
        }
      }
    })
    
    // Wait for initial load to complete
    await flushPromises()
    
    // Advance timers to process any timeouts
    await vi.advanceTimersByTimeAsync(200)
    await flushPromises()
    await nextTick()
    
    // Ensure loading is complete
    const store = useScrollItemsStore()
    store.addItems([
      {
        id: 'test-1',
        type: 'image',
        position: { x: 0, y: 0 },
        velocity: 1,
        rotation: 0,
        zIndex: 1,
        content: { url: 'test.jpg', title: 'Test', size: 'medium' }
      }
    ])
  })
  
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    wrapper.unmount()
  })
  
  describe('Download button visibility', () => {
    it('should not show download button when not paused', () => {
      // Ensure board is not paused
      const pauseButton = wrapper.find('#pause-button')
      const downloadButton = wrapper.find('.download-button')
      
      expect(pauseButton.exists()).toBe(true)
      expect(downloadButton.exists()).toBe(false)
    })
    
    it('should show download button when paused', async () => {
      // Click pause button
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      // Check download button appears
      const downloadButton = wrapper.find('.download-button')
      expect(downloadButton.exists()).toBe(true)
      expect(downloadButton.text()).toContain('PNG保存')
    })
  })
  
  describe('Download functionality', () => {
    it('should trigger download when button is clicked', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      const mockDataUrl = 'data:image/png;base64,test'
      domtoimage.toPng.mockResolvedValue(mockDataUrl)
      
      // Mock URL methods
      const mockUrl = 'blob:http://example.com/123'
      URL.createObjectURL = vi.fn(() => mockUrl)
      URL.revokeObjectURL = vi.fn()
      
      // Mock link click
      const mockClick = vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const element = originalCreateElement(tag)
          element.click = mockClick
          return element
        }
        return originalCreateElement(tag)
      })
      
      // Pause the board
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      // Click download button
      const downloadButton = wrapper.find('.download-button')
      await downloadButton.trigger('click')
      await flushPromises()
      
      // Verify download was triggered
      expect(domtoimage.toPng).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })
    
    it('should show loading state during capture', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      
      // Setup mock to delay
      let resolveCapture: ((value: string) => void) | undefined
      domtoimage.toPng.mockImplementation(() => new Promise<string>((resolve) => {
        resolveCapture = resolve
      }))
      
      // Pause the board
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      // Start download
      const downloadButton = wrapper.find('.download-button')
      await downloadButton.trigger('click')
      await nextTick()
      
      // Check loading state
      expect(downloadButton.attributes('disabled')).toBeDefined()
      expect(downloadButton.text()).toContain('処理中...')
      
      // Resolve capture
      const mockDataUrl = 'data:image/png;base64,test'
      if (resolveCapture !== undefined) {
        resolveCapture(mockDataUrl)
      }
      await flushPromises()
      
      // Check loading state cleared
      expect(downloadButton.attributes('disabled')).toBeUndefined()
      expect(downloadButton.text()).toContain('PNG保存')
    })
    
    it('should handle keyboard shortcuts (Enter/Space)', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      const mockDataUrl = 'data:image/png;base64,test'
      domtoimage.toPng.mockResolvedValue(mockDataUrl)
      
      // Pause the board
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      const downloadButton = wrapper.find('.download-button')
      
      // Test Enter key
      await downloadButton.trigger('keydown.enter')
      await flushPromises()
      expect(domtoimage.toPng).toHaveBeenCalledTimes(1)
      
      // Test Space key
      await downloadButton.trigger('keydown.space')
      await flushPromises()
      expect(domtoimage.toPng).toHaveBeenCalledTimes(2)
    })
  })
  
  describe('Error handling', () => {
    it('should display error notification on capture failure', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      domtoimage.toPng.mockRejectedValue(new Error('Canvas tainted'))
      
      // Pause the board
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      // Try to download
      const downloadButton = wrapper.find('.download-button')
      await downloadButton.trigger('click')
      await flushPromises()
      
      // Check error notification
      const notification = wrapper.find('.error-notification')
      expect(notification.exists()).toBe(true)
      expect(notification.text()).toContain('一部の画像をキャプチャできません')
    })
    
    it('should display timeout error after 10 seconds', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      domtoimage.toPng.mockImplementation(() => new Promise(() => {})) // Never resolves
      
      // Pause the board
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      // Try to download
      const downloadButton = wrapper.find('.download-button')
      await downloadButton.trigger('click')
      
      // Advance timer by 10 seconds
      await vi.advanceTimersByTimeAsync(10000)
      await flushPromises()
      
      // Check timeout error
      const notification = wrapper.find('.error-notification')
      expect(notification.exists()).toBe(true)
      expect(notification.text()).toContain('処理がタイムアウトしました')
    })
  })
  
  describe('Success notification', () => {
    it('should display success notification after download', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      const mockDataUrl = 'data:image/png;base64,test'
      domtoimage.toPng.mockResolvedValue(mockDataUrl)
      
      // Mock link click
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const element = originalCreateElement(tag)
          element.click = vi.fn()
          return element
        }
        return originalCreateElement(tag)
      })
      
      // Pause the board
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      // Download
      const downloadButton = wrapper.find('.download-button')
      await downloadButton.trigger('click')
      await flushPromises()
      
      // Check success notification
      const notification = wrapper.find('.success-notification')
      expect(notification.exists()).toBe(true)
      expect(notification.text()).toContain('画像を保存しました')
    })
    
    it('should auto-clear success notification after 3 seconds', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      const mockDataUrl = 'data:image/png;base64,test'
      domtoimage.toPng.mockResolvedValue(mockDataUrl)
      
      // Pause and download
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      const downloadButton = wrapper.find('.download-button')
      await downloadButton.trigger('click')
      await flushPromises()
      
      // Verify success notification exists
      let notification = wrapper.find('.success-notification')
      expect(notification.exists()).toBe(true)
      
      // Advance timer by 3 seconds
      await vi.advanceTimersByTimeAsync(3000)
      await nextTick()
      
      // Check notification is cleared
      notification = wrapper.find('.success-notification')
      expect(notification.exists()).toBe(false)
    })
    
    it('should allow manual close of notifications', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      domtoimage.toPng.mockRejectedValue(new Error('Test error'))
      
      // Pause and try download
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      const downloadButton = wrapper.find('.download-button')
      await downloadButton.trigger('click')
      await flushPromises()
      
      // Check error notification exists
      let notification = wrapper.find('.error-notification')
      expect(notification.exists()).toBe(true)
      
      // Click close button
      const closeButton = wrapper.find('.notification-close')
      await closeButton.trigger('click')
      await nextTick()
      
      // Check notification is cleared
      notification = wrapper.find('.error-notification')
      expect(notification.exists()).toBe(false)
    })
  })
  
  describe('Accessibility', () => {
    it('should have proper ARIA attributes on download button', async () => {
      // Pause the board
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      const downloadButton = wrapper.find('.download-button')
      expect(downloadButton.attributes('role')).toBe('button')
      expect(downloadButton.attributes('aria-label')).toBe('画像をダウンロード')
      expect(downloadButton.attributes('tabindex')).toBe('0')
    })
    
    it('should have proper ARIA attributes on notifications', async () => {
      const { default: domtoimage } = (await import('dom-to-image-more')) as unknown as { default: { toPng: ReturnType<typeof vi.fn> } }
      domtoimage.toPng.mockRejectedValue(new Error('Test error'))
      
      // Trigger error
      const pauseButton = wrapper.find('#pause-button')
      await pauseButton.trigger('click')
      await nextTick()
      
      const downloadButton = wrapper.find('.download-button')
      await downloadButton.trigger('click')
      await flushPromises()
      
      const notification = wrapper.find('.notification')
      expect(notification.attributes('role')).toBe('alert')
      expect(notification.attributes('aria-live')).toBe('assertive')
    })
  })
})