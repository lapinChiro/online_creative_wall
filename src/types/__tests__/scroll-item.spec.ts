import { describe, it, expect } from 'vitest'
import {
  isImageScrollItem,
  isTextScrollItem,
  isScrollItem,
  type ImageScrollItem,
  type TextScrollItem,
} from '../scroll-item'

describe('Type Guards', () => {
  describe('isImageScrollItem', () => {
    it('should return true for valid ImageScrollItem', () => {
      const item: ImageScrollItem = {
        id: 'img-1',
        type: 'image',
        position: { x: 100, y: 200 },
        velocity: -50,
        zIndex: 1,
        rotation: 0,
        content: {
          url: 'https://example.com/image.jpg',
          title: 'Test image',
          size: 'medium',
        },
      }
      expect(isImageScrollItem(item)).toBe(true)
    })

    it('should return false for TextScrollItem', () => {
      const item: TextScrollItem = {
        id: 'text-1',
        type: 'text',
        position: { x: 100, y: 200 },
        velocity: -50,
        zIndex: 1,
        rotation: 0,
        content: {
          text: 'Hello World',
          fontSize: 1.5,
          color: 'yellow',
        },
      }
      expect(isImageScrollItem(item)).toBe(false)
    })

    it('should return false for invalid object', () => {
      const item = {
        id: 'invalid',
        type: 'unknown',
      }
      expect(isImageScrollItem(item as any)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isImageScrollItem(null as any)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isImageScrollItem(undefined as any)).toBe(false)
    })
  })

  describe('isTextScrollItem', () => {
    it('should return true for valid TextScrollItem', () => {
      const item: TextScrollItem = {
        id: 'text-1',
        type: 'text',
        position: { x: 100, y: 200 },
        velocity: -50,
        zIndex: 1,
        rotation: 0,
        content: {
          text: 'Test text',
          fontSize: 1.2,
          color: 'pink',
        },
      }
      expect(isTextScrollItem(item)).toBe(true)
    })

    it('should return false for ImageScrollItem', () => {
      const item: ImageScrollItem = {
        id: 'img-1',
        type: 'image',
        position: { x: 100, y: 200 },
        velocity: -50,
        zIndex: 1,
        rotation: 0,
        content: {
          url: 'https://example.com/image.jpg',
          title: 'Test image',
          size: 'large',
        },
      }
      expect(isTextScrollItem(item)).toBe(false)
    })

    it('should return false for invalid object', () => {
      const item = {
        id: 'invalid',
        type: 'unknown',
      }
      expect(isTextScrollItem(item as any)).toBe(false)
    })
  })

  describe('isScrollItem', () => {
    it('should return true for ImageScrollItem', () => {
      const item: ImageScrollItem = {
        id: 'img-1',
        type: 'image',
        position: { x: 100, y: 200 },
        velocity: -50,
        zIndex: 1,
        rotation: 0,
        content: {
          url: 'https://example.com/image.jpg',
          title: 'Test image',
          size: 'small',
        },
      }
      expect(isScrollItem(item)).toBe(true)
    })

    it('should return true for TextScrollItem', () => {
      const item: TextScrollItem = {
        id: 'text-1',
        type: 'text',
        position: { x: 100, y: 200 },
        velocity: -50,
        zIndex: 1,
        rotation: 0,
        content: {
          text: 'Test text',
          fontSize: 1.8,
          color: 'blue',
        },
      }
      expect(isScrollItem(item)).toBe(true)
    })

    it('should return false for invalid type', () => {
      const item = {
        id: 'invalid',
        type: 'unknown',
        position: { x: 100, y: 200 },
        velocity: -50,
        zIndex: 1,
        rotation: 0,
        content: {},
      }
      expect(isScrollItem(item)).toBe(false)
    })

    it('should return false for missing required fields', () => {
      const item = {
        id: 'invalid',
        type: 'image',
      }
      expect(isScrollItem(item)).toBe(false)
    })

    it('should return false for null', () => {
      expect(isScrollItem(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isScrollItem(undefined)).toBe(false)
    })

    it('should return false for primitive values', () => {
      expect(isScrollItem('string')).toBe(false)
      expect(isScrollItem(123)).toBe(false)
      expect(isScrollItem(true)).toBe(false)
    })
  })
})