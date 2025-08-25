import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScrollItemsStore } from '../scrollItems'
import type { ImageScrollItem, TextScrollItem } from '@/types/scroll-item'

describe('ScrollItems Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createImageItem = (id: string): ImageScrollItem => ({
    id,
    type: 'image',
    position: { x: 100, y: 100 },
    velocity: -50,
    zIndex: 1,
    rotation: 0,
    content: {
      url: 'https://example.com/image.jpg',
      title: 'Test image',
      size: 'medium',
    },
  })

  const createTextItem = (id: string): TextScrollItem => ({
    id,
    type: 'text',
    position: { x: 300, y: 100 },
    velocity: -60,
    zIndex: 2,
    rotation: 0,
    content: {
      text: 'Test text',
      fontSize: 1.5,
      color: 'yellow',
    },
  })

  describe('Initial State', () => {
    it('should have empty items initially', () => {
      const store = useScrollItemsStore()
      expect(store.items).toEqual([])
    })

    it('should have speed multiplier of 1', () => {
      const store = useScrollItemsStore()
      expect(store.speedMultiplier).toBe(1)
    })
    
    it('should have isPaused as false initially', () => {
      const store = useScrollItemsStore()
      expect(store.isPaused).toBe(false)
    })
    
    it('should have empty pausedPositions initially', () => {
      const store = useScrollItemsStore()
      expect(store.pausedPositions.size).toBe(0)
    })
    
    it('should have null pauseTimestamp initially', () => {
      const store = useScrollItemsStore()
      expect(store.pauseTimestamp).toBeNull()
    })

    it('should have board dimensions of 0', () => {
      const store = useScrollItemsStore()
      expect(store.boardWidth).toBe(0)
      expect(store.boardHeight).toBe(0)
    })

    it('should have globalVelocity of 100', () => {
      const store = useScrollItemsStore()
      expect(store.globalVelocity).toBe(100)
    })

    it('should have itemCount of 20', () => {
      const store = useScrollItemsStore()
      expect(store.itemCount).toBe(20)
    })

    it('should have showTexts as true', () => {
      const store = useScrollItemsStore()
      expect(store.showTexts).toBe(true)
    })
  })

  describe('Actions', () => {
    describe('addItem', () => {
      it('should add item to the store', () => {
        const store = useScrollItemsStore()
        const item = createImageItem('img-1')
        
        store.addItem(item)
        
        expect(store.items).toHaveLength(1)
        expect(store.items[0]).toEqual(item)
      })

      it('should add multiple items', () => {
        const store = useScrollItemsStore()
        const item1 = createImageItem('img-1')
        const item2 = createTextItem('text-1')
        
        store.addItem(item1)
        store.addItem(item2)
        
        expect(store.items).toHaveLength(2)
        expect(store.items).toContainEqual(item1)
        expect(store.items).toContainEqual(item2)
      })
    })

    describe('removeItem', () => {
      it('should remove item by id', () => {
        const store = useScrollItemsStore()
        const item1 = createImageItem('img-1')
        const item2 = createTextItem('text-1')
        
        store.addItem(item1)
        store.addItem(item2)
        store.removeItem('img-1')
        
        expect(store.items).toHaveLength(1)
        expect(store.items[0]).toEqual(item2)
      })

      it('should handle removing non-existent item', () => {
        const store = useScrollItemsStore()
        const item = createImageItem('img-1')
        
        store.addItem(item)
        store.removeItem('non-existent')
        
        expect(store.items).toHaveLength(1)
      })
    })

    describe('updateItem', () => {
      it('should update existing item', () => {
        const store = useScrollItemsStore()
        const item = createImageItem('img-1')
        
        store.addItem(item)
        store.updateItem('img-1', { position: { x: 500, y: 300 } })
        
        expect(store.items[0]?.position.x).toBe(500)
        expect(store.items[0]?.position.y).toBe(300)
      })

      it('should handle updating non-existent item', () => {
        const store = useScrollItemsStore()
        
        expect(() => {
          store.updateItem('non-existent', { position: { x: 500, y: 300 } })
        }).not.toThrow()
      })

      it('should update multiple properties', () => {
        const store = useScrollItemsStore()
        const item = createImageItem('img-1')
        
        store.addItem(item)
        store.updateItem('img-1', { 
          position: { x: 500, y: 300 },
          velocity: -100,
          zIndex: 10
        })
        
        expect(store.items[0]).toMatchObject({
          position: { x: 500, y: 300 },
          velocity: -100,
          zIndex: 10,
        })
      })
    })

    describe('clearItems', () => {
      it('should remove all items', () => {
        const store = useScrollItemsStore()
        
        store.addItem(createImageItem('img-1'))
        store.addItem(createTextItem('text-1'))
        store.addItem(createImageItem('img-2'))
        
        expect(store.items).toHaveLength(3)
        
        store.clearItems()
        
        expect(store.items).toHaveLength(0)
      })
    })

    describe('setSpeedMultiplier', () => {
      it('should update speed multiplier', () => {
        const store = useScrollItemsStore()
        
        store.setSpeedMultiplier(2.5)
        
        expect(store.speedMultiplier).toBe(2.5)
        expect(store.globalVelocity).toBe(250)
      })

      it('should accept negative values', () => {
        const store = useScrollItemsStore()
        
        store.setSpeedMultiplier(-1)
        
        expect(store.speedMultiplier).toBe(-1)
        expect(store.globalVelocity).toBe(-100)
      })
    })

    describe('setBoardDimensions', () => {
      it('should update board dimensions', () => {
        const store = useScrollItemsStore()
        
        store.setBoardDimensions(1920, 1080)
        
        expect(store.boardWidth).toBe(1920)
        expect(store.boardHeight).toBe(1080)
      })
    })

    describe('setItems', () => {
      it('should replace all items', () => {
        const store = useScrollItemsStore()
        const oldItems = [createImageItem('old-1')]
        const newItems = [
          createImageItem('new-1'),
          createTextItem('new-2'),
        ]
        
        store.setItems(oldItems)
        expect(store.items).toEqual(oldItems)
        
        store.setItems(newItems)
        expect(store.items).toEqual(newItems)
      })
    })

    describe('updateGlobalVelocity', () => {
      it('should update global velocity within bounds', () => {
        const store = useScrollItemsStore()
        
        store.updateGlobalVelocity(120)
        expect(store.globalVelocity).toBe(120)
        
        store.updateGlobalVelocity(200)
        expect(store.globalVelocity).toBe(150) // max limit
        
        store.updateGlobalVelocity(5)
        expect(store.globalVelocity).toBe(10) // min limit
      })
    })

    describe('toggleTexts', () => {
      it('should toggle text visibility', () => {
        const store = useScrollItemsStore()
        
        expect(store.showTexts).toBe(true)
        
        store.toggleTexts()
        expect(store.showTexts).toBe(false)
        
        store.toggleTexts()
        expect(store.showTexts).toBe(true)
      })
    })
  })

  describe('Getters', () => {
    describe('getItemById', () => {
      it('should return item by id', () => {
        const store = useScrollItemsStore()
        const item = createImageItem('img-1')
        
        store.addItem(item)
        
        expect(store.getItemById('img-1')).toEqual(item)
      })

      it('should return undefined for non-existent id', () => {
        const store = useScrollItemsStore()
        
        expect(store.getItemById('non-existent')).toBeUndefined()
      })
    })

    describe('imageItems', () => {
      it('should return only image items', () => {
        const store = useScrollItemsStore()
        const img1 = createImageItem('img-1')
        const text1 = createTextItem('text-1')
        const img2 = createImageItem('img-2')
        
        store.addItem(img1)
        store.addItem(text1)
        store.addItem(img2)
        
        expect(store.imageItems).toHaveLength(2)
        expect(store.imageItems).toContainEqual(img1)
        expect(store.imageItems).toContainEqual(img2)
      })
    })

    describe('textItems', () => {
      it('should return only text items', () => {
        const store = useScrollItemsStore()
        const img1 = createImageItem('img-1')
        const text1 = createTextItem('text-1')
        const text2 = createTextItem('text-2')
        
        store.addItem(img1)
        store.addItem(text1)
        store.addItem(text2)
        
        expect(store.textItems).toHaveLength(2)
        expect(store.textItems).toContainEqual(text1)
        expect(store.textItems).toContainEqual(text2)
      })
    })

    describe('itemCount', () => {
      it('should return total item count', () => {
        const store = useScrollItemsStore()
        
        expect(store.itemCount).toBe(20) // default value
        
        store.updateItemCount(50)
        expect(store.itemCount).toBe(50)
      })
    })

    describe('visibleItems', () => {
      it('should return items within board bounds', () => {
        const store = useScrollItemsStore()
        store.setBoardDimensions(800, 600)
        
        const items = [
          createImageItem('img-1'),
          createTextItem('text-1'),
          createImageItem('img-2'),
        ]
        
        store.setItems(items)
        store.updateItemCount(2)
        
        expect(store.visibleItems).toHaveLength(2)
      })

      it('should respect showTexts setting', () => {
        const store = useScrollItemsStore()
        
        const img1 = createImageItem('img-1')
        const text1 = createTextItem('text-1')
        const img2 = createImageItem('img-2')
        
        store.addItem(img1)
        store.addItem(text1)
        store.addItem(img2)
        
        store.setShowTexts(false)
        const visible = store.visibleItems
        
        // When texts are hidden, only images should be visible
        expect(visible.every(item => item.type === 'image')).toBe(true)
      })
    })


    describe('itemsCount', () => {
      it('should return counts by type', () => {
        const store = useScrollItemsStore()
        
        store.addItem(createImageItem('img-1'))
        store.addItem(createTextItem('text-1'))
        store.addItem(createImageItem('img-2'))
        store.addItem(createTextItem('text-2'))
        
        expect(store.itemsCount).toEqual({
          total: 4,
          images: 2,
          texts: 2,
        })
      })
    })
  })

  describe('$reset', () => {
    it('should reset store to initial state', () => {
      const store = useScrollItemsStore()
      
      store.addItem(createImageItem('img-1'))
      store.updateGlobalVelocity(150)
      store.updateItemCount(50)
      store.setShowTexts(false)
      
      store.$reset()
      
      expect(store.items).toEqual([])
      expect(store.globalVelocity).toBe(50)
      expect(store.itemCount).toBe(20)
      expect(store.showTexts).toBe(true)
    })
    
    it('should reset PAUSE state to initial values', () => {
      const store = useScrollItemsStore()
      
      store.setIsPaused(true)
      store.savePausedPosition('test-id', 100)
      
      store.$reset()
      
      expect(store.isPaused).toBe(false)
      expect(store.pausedPositions.size).toBe(0)
      expect(store.pauseTimestamp).toBeNull()
    })
  })
  
  describe('PAUSE Functionality', () => {
    it('should set isPaused to true and set timestamp', () => {
      const store = useScrollItemsStore()
      const beforeTime = Date.now()
      
      store.setIsPaused(true)
      
      expect(store.isPaused).toBe(true)
      expect(store.pauseTimestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(store.pauseTimestamp).toBeLessThanOrEqual(Date.now())
    })
    
    it('should set isPaused to false and clear timestamp', () => {
      const store = useScrollItemsStore()
      store.setIsPaused(true)
      store.savePausedPosition('test-id', 100)
      
      store.setIsPaused(false)
      
      expect(store.isPaused).toBe(false)
      expect(store.pauseTimestamp).toBeNull()
      expect(store.pausedPositions.size).toBe(0)
    })
    
    it('should toggle pause state correctly', () => {
      const store = useScrollItemsStore()
      
      expect(store.isPaused).toBe(false)
      
      store.togglePause()
      expect(store.isPaused).toBe(true)
      
      store.togglePause()
      expect(store.isPaused).toBe(false)
    })
    
    it('should save and retrieve paused positions', () => {
      const store = useScrollItemsStore()
      
      store.savePausedPosition('item-1', 100)
      store.savePausedPosition('item-2', 200)
      
      expect(store.getPausedPositionX('item-1')).toBe(100)
      expect(store.getPausedPositionX('item-2')).toBe(200)
      expect(store.getPausedPositionX('item-3')).toBeUndefined()
    })
    
    it('should clear all paused positions', () => {
      const store = useScrollItemsStore()
      
      store.savePausedPosition('item-1', 100)
      store.savePausedPosition('item-2', 200)
      
      store.clearPausedPositions()
      
      expect(store.pausedPositions.size).toBe(0)
      expect(store.getPausedPositionX('item-1')).toBeUndefined()
      expect(store.getPausedPositionX('item-2')).toBeUndefined()
    })
    
    it('should maintain PAUSE state independent of speed changes', () => {
      const store = useScrollItemsStore()
      
      store.setIsPaused(true)
      const originalPauseState = store.isPaused
      
      store.updateGlobalVelocity(150)
      
      expect(store.isPaused).toBe(originalPauseState)
      expect(store.globalVelocity).toBe(150)
    })
    
    it('should maintain PAUSE state independent of text visibility changes', () => {
      const store = useScrollItemsStore()
      
      store.setIsPaused(true)
      const originalPauseState = store.isPaused
      
      store.toggleTexts()
      
      expect(store.isPaused).toBe(originalPauseState)
    })
  })
})