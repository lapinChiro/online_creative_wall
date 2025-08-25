import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePauseControl } from '../usePauseControl'
import { useScrollItemsStore } from '@/stores/scrollItems'

describe('usePauseControl', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have isPaused as false initially', () => {
      const { isPaused } = usePauseControl()
      expect(isPaused.value).toBe(false)
    })

    it('should have empty pausedPositions initially', () => {
      const { pausedPositions } = usePauseControl()
      expect(pausedPositions.value.size).toBe(0)
    })

    it('should have null pauseTimestamp initially', () => {
      const { pauseTimestamp } = usePauseControl()
      expect(pauseTimestamp.value).toBeNull()
    })
  })

  describe('Pause and Resume', () => {
    it('should pause animation when pause() is called', () => {
      const { isPaused, pause } = usePauseControl()
      
      pause()
      
      expect(isPaused.value).toBe(true)
    })

    it('should resume animation when resume() is called', () => {
      const { isPaused, pause, resume } = usePauseControl()
      
      pause()
      expect(isPaused.value).toBe(true)
      
      resume()
      expect(isPaused.value).toBe(false)
    })

    it('should not pause again if already paused', () => {
      const { pause } = usePauseControl()
      const store = useScrollItemsStore()
      const spy = vi.spyOn(store, 'setIsPaused')
      
      pause()
      spy.mockClear()
      pause()
      
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not resume if not paused', () => {
      const { resume } = usePauseControl()
      const store = useScrollItemsStore()
      const spy = vi.spyOn(store, 'setIsPaused')
      
      resume()
      
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('Toggle Functionality', () => {
    it('should toggle pause state correctly', () => {
      const { isPaused, toggle } = usePauseControl()
      
      expect(isPaused.value).toBe(false)
      
      toggle()
      expect(isPaused.value).toBe(true)
      
      toggle()
      expect(isPaused.value).toBe(false)
    })
  })

  describe('Position Management', () => {
    it('should save position for an item', () => {
      const { savePosition, getSavedPosition } = usePauseControl()
      
      savePosition('item-1', 100)
      
      expect(getSavedPosition('item-1')).toBe(100)
    })

    it('should return undefined for non-existent item', () => {
      const { getSavedPosition } = usePauseControl()
      
      expect(getSavedPosition('non-existent')).toBeUndefined()
    })

    it('should clear all saved positions', () => {
      const { savePosition, getSavedPosition, clearSavedPositions } = usePauseControl()
      
      savePosition('item-1', 100)
      savePosition('item-2', 200)
      
      clearSavedPositions()
      
      expect(getSavedPosition('item-1')).toBeUndefined()
      expect(getSavedPosition('item-2')).toBeUndefined()
    })

    it('should save multiple positions at once', () => {
      const { saveAllPositions, getSavedPosition } = usePauseControl()
      
      const positions = [
        { id: 'item-1', translateX: 100 },
        { id: 'item-2', translateX: 200 },
        { id: 'item-3', translateX: 300 }
      ]
      
      saveAllPositions(positions)
      
      expect(getSavedPosition('item-1')).toBe(100)
      expect(getSavedPosition('item-2')).toBe(200)
      expect(getSavedPosition('item-3')).toBe(300)
    })
  })

  describe('Performance Requirements', () => {
    it('should complete pause operation within 50ms', () => {
      const { pause } = usePauseControl()
      
      const startTime = performance.now()
      pause()
      const endTime = performance.now()
      
      const elapsed = endTime - startTime
      expect(elapsed).toBeLessThan(50)
    })

    it('should complete resume operation within 50ms', () => {
      const { pause, resume } = usePauseControl()
      
      pause()
      
      const startTime = performance.now()
      resume()
      const endTime = performance.now()
      
      const elapsed = endTime - startTime
      expect(elapsed).toBeLessThan(50)
    })

    it('should complete toggle operation within 50ms', () => {
      const { toggle } = usePauseControl()
      
      const startTime = performance.now()
      toggle()
      const endTime = performance.now()
      
      const elapsed = endTime - startTime
      expect(elapsed).toBeLessThan(50)
    })
  })

  describe('Reactive State', () => {
    it('should have reactive isPaused state', () => {
      const { isPaused, toggle } = usePauseControl()
      const states: boolean[] = []
      
      // Track state changes
      states.push(isPaused.value)
      toggle()
      states.push(isPaused.value)
      toggle()
      states.push(isPaused.value)
      
      expect(states).toEqual([false, true, false])
    })

    it('should have reactive pausedPositions state', () => {
      const { pausedPositions, savePosition } = usePauseControl()
      
      expect(pausedPositions.value.size).toBe(0)
      
      savePosition('item-1', 100)
      expect(pausedPositions.value.size).toBe(1)
      
      savePosition('item-2', 200)
      expect(pausedPositions.value.size).toBe(2)
    })

    it('should have reactive pauseTimestamp state', () => {
      const { pauseTimestamp, pause, resume } = usePauseControl()
      
      expect(pauseTimestamp.value).toBeNull()
      
      pause()
      expect(pauseTimestamp.value).not.toBeNull()
      
      resume()
      expect(pauseTimestamp.value).toBeNull()
    })
  })
})