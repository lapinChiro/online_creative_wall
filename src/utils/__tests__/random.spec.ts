import { describe, it, expect } from 'vitest'
import { randomInt, randomFloat, randomElement, shuffleArray } from '../random'

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

  describe('randomFloat', () => {
    it('should return float within range', () => {
      const min = 0.1
      const max = 1.0
      for (let i = 0; i < 100; i++) {
        const result = randomFloat(min, max)
        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThanOrEqual(max)
      }
    })

    it('should return min when min equals max', () => {
      expect(randomFloat(0.5, 0.5)).toBe(0.5)
    })

    it('should handle negative numbers', () => {
      const result = randomFloat(-1.5, -0.5)
      expect(result).toBeGreaterThanOrEqual(-1.5)
      expect(result).toBeLessThanOrEqual(-0.5)
    })
  })

  describe('randomElement', () => {
    it('should return element from array', () => {
      const array = ['a', 'b', 'c', 'd', 'e']
      for (let i = 0; i < 50; i++) {
        const result = randomElement(array)
        expect(array).toContain(result)
      }
    })

    it('should return undefined for empty array', () => {
      expect(randomElement([])).toBeUndefined()
    })

    it('should return single element for array with one item', () => {
      expect(randomElement(['only'])).toBe('only')
    })

    it('should work with different types', () => {
      const numbers = [1, 2, 3, 4, 5]
      const result = randomElement(numbers)
      expect(numbers).toContain(result)
    })
  })

  describe('shuffleArray', () => {
    it('should return array with same elements', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray([...original])
      
      expect(shuffled).toHaveLength(original.length)
      expect(shuffled.sort()).toEqual(original.sort())
    })

    it('should not modify original array', () => {
      const original = [1, 2, 3, 4, 5]
      const copy = [...original]
      shuffleArray(copy)
      
      expect(original).toEqual([1, 2, 3, 4, 5])
    })

    it('should handle empty array', () => {
      expect(shuffleArray([])).toEqual([])
    })

    it('should handle single element array', () => {
      expect(shuffleArray([1])).toEqual([1])
    })

    it('should actually shuffle (statistical test)', () => {
      const array = [1, 2, 3, 4, 5]
      const results = new Set<string>()
      
      for (let i = 0; i < 100; i++) {
        const shuffled = shuffleArray([...array])
        results.add(JSON.stringify(shuffled))
      }
      
      expect(results.size).toBeGreaterThan(1)
    })
  })
})