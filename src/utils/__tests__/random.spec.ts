import { describe, it, expect } from 'vitest'
import { randomInt, randomChoice, randomRange } from '../random'

describe('Random Utilities', () => {
  describe('randomInt', () => {
    it('should return integer within range', () => {
      const min = 1
      const max = 10
      for (let i = 0; i < 100; i++) {
        const result = randomInt(min, max)
        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it('should return min when min equals max', () => {
      expect(randomInt(5, 5)).toBe(5)
    })

    it('should handle negative numbers', () => {
      const result = randomInt(-10, -1)
      expect(result).toBeGreaterThanOrEqual(-10)
      expect(result).toBeLessThanOrEqual(-1)
    })

    it('should swap min and max if min > max', () => {
      const result = randomInt(10, 1)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
    })
  })

  describe('randomRange', () => {
    it('should return float within range', () => {
      const min = 0.1
      const max = 1.0
      for (let i = 0; i < 100; i++) {
        const result = randomRange(min, max)
        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)
      }
    })

    it('should return min when min equals max', () => {
      expect(randomRange(0.5, 0.5)).toBe(0.5)
    })

    it('should handle negative numbers', () => {
      const result = randomRange(-1.5, -0.5)
      expect(result).toBeGreaterThanOrEqual(-1.5)
      expect(result).toBeLessThanOrEqual(-0.5)
    })
  })

  describe('randomChoice', () => {
    it('should return element from array', () => {
      const array = ['a', 'b', 'c', 'd', 'e']
      for (let i = 0; i < 50; i++) {
        const result = randomChoice(array)
        expect(array).toContain(result)
      }
    })

    it('should throw error for empty array', () => {
      const emptyArray: string[] = []
      expect(() => randomChoice(emptyArray)).toThrow('Cannot choose from empty array')
    })

    it('should return single element for array with one item', () => {
      expect(randomChoice(['only'])).toBe('only')
    })

    it('should work with different types', () => {
      const numbers = [1, 2, 3, 4, 5]
      const result = randomChoice(numbers)
      expect(numbers).toContain(result)
    })
  })
})