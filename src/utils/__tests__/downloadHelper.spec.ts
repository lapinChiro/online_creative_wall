import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
// Will fail initially - file does not exist yet (RED phase)
import { formatDownloadFilename } from '../downloadHelper'

describe('downloadHelper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('formatDownloadFilename', () => {
    it('should format filename with YYYYMMDD-HHmmss pattern', () => {
      // Test will fail initially (RED)
      vi.setSystemTime(new Date('2025-08-26T15:30:45'))
      expect(formatDownloadFilename()).toBe('creative-wall-20250826-153045.png')
    })
    
    it('should pad single digits with zero', () => {
      // Test will fail initially (RED)
      vi.setSystemTime(new Date('2025-01-05T09:05:08'))
      expect(formatDownloadFilename()).toBe('creative-wall-20250105-090508.png')
    })
    
    it('should handle midnight correctly', () => {
      // Test will fail initially (RED)
      vi.setSystemTime(new Date('2025-12-31T00:00:00'))
      expect(formatDownloadFilename()).toBe('creative-wall-20251231-000000.png')
    })
    
    it('should handle noon correctly', () => {
      // Test will fail initially (RED)
      vi.setSystemTime(new Date('2025-06-15T12:00:00'))
      expect(formatDownloadFilename()).toBe('creative-wall-20250615-120000.png')
    })
    
    it('should handle last second of day', () => {
      // Test will fail initially (RED)
      vi.setSystemTime(new Date('2025-03-31T23:59:59'))
      expect(formatDownloadFilename()).toBe('creative-wall-20250331-235959.png')
    })
  })
})