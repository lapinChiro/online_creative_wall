import { describe, it, expect } from 'vitest'
import {
  isImageItem,
  isTextItem,
  type ImageScrollItem,
  type TextScrollItem,
} from '../scroll-item'

describe('Type Guards', () => {
  describe('isImageItem', () => {
    it('should return true for ImageScrollItem', () => {
      const item: ImageScrollItem = {
        id: 'img-1',
        type: 'image',
        position: { x: 10, y: 20 },
        velocity: 5,
        zIndex: 1,
        rotation: 0,
        content: {
          url: 'http://example.com/image.jpg',
          title: 'Test Image',
          size: 'medium',
        },
      }
      expect(isImageItem(item)).toBe(true)
    })

    it('should return false for TextScrollItem', () => {
      const item: TextScrollItem = {
        id: 'txt-1',
        type: 'text',
        position: { x: 10, y: 20 },
        velocity: 5,
        zIndex: 1,
        rotation: 0,
        content: {
          text: 'Test Text',
          color: 'yellow',
          fontSize: 1.5,
        },
      }
      expect(isImageItem(item)).toBe(false)
    })
  })

  describe('isTextItem', () => {
    it('should return true for TextScrollItem', () => {
      const item: TextScrollItem = {
        id: 'txt-1',
        type: 'text',
        position: { x: 10, y: 20 },
        velocity: 5,
        zIndex: 1,
        rotation: 0,
        content: {
          text: 'Test Text',
          color: 'yellow',
          fontSize: 1.5,
        },
      }
      expect(isTextItem(item)).toBe(true)
    })

    it('should return false for ImageScrollItem', () => {
      const item: ImageScrollItem = {
        id: 'img-1',
        type: 'image',
        position: { x: 10, y: 20 },
        velocity: 5,
        zIndex: 1,
        rotation: 0,
        content: {
          url: 'http://example.com/image.jpg',
          title: 'Test Image',
          size: 'medium',
        },
      }
      expect(isTextItem(item)).toBe(false)
    })
  })
})