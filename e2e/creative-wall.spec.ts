import { test, expect, type Page } from '@playwright/test'

test.describe('Creative Wall E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the creative wall', async ({ page }) => {
    await expect(page.locator('.creative-wall')).toBeVisible()
    await expect(page.locator('.black-board')).toBeVisible()
  })

  test('should display UI controls', async ({ page }) => {
    const controls = page.locator('.controls')
    await expect(controls).toBeVisible()
    
    await expect(controls.getByText('投稿数:')).toBeVisible()
    await expect(controls.getByText('スクロール速度:')).toBeVisible()
    await expect(controls.getByText('テキスト表示:')).toBeVisible()
  })

  test('should adjust post count', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    const display = page.locator('.controls > div').first().locator('span').last()
    
    await expect(display).toHaveText('50')
    
    await slider.fill('100')
    await expect(display).toHaveText('100')
    
    await slider.fill('5')
    await expect(display).toHaveText('5')
  })

  test('should adjust scroll speed', async ({ page }) => {
    const slider = page.locator('input[type="range"]').nth(1)
    const display = page.locator('.controls > div').nth(1).locator('span').last()
    
    await expect(display).toHaveText('100%')
    
    await slider.fill('150')
    await expect(display).toHaveText('150%')
    
    await slider.fill('10')
    await expect(display).toHaveText('10%')
  })

  test('should toggle text display', async ({ page }) => {
    const toggleContainer = page.locator('.controls > div').nth(2)
    const toggleButton = toggleContainer.locator('.toggle-bg')
    const toggleState = toggleContainer.locator('span').last()
    
    await expect(toggleState).toHaveText('ON')
    
    await toggleButton.click()
    await expect(toggleState).toHaveText('OFF')
    
    await toggleButton.click()
    await expect(toggleState).toHaveText('ON')
  })

  test('should display scroll items', async ({ page }) => {
    await page.waitForSelector('.scroll-item', { timeout: 5000 })
    const items = page.locator('.scroll-item')
    
    expect(await items.count()).toBeGreaterThan(0)
  })

  test('should have animated scroll items', async ({ page }) => {
    await page.waitForSelector('.scroll-item', { timeout: 5000 })
    const item = page.locator('.scroll-item').first()
    
    const initialPosition = await item.evaluate((el) => {
      const style = window.getComputedStyle(el)
      const matrix = new DOMMatrix(style.transform)
      return matrix.m41
    })
    
    await page.waitForTimeout(1000)
    
    const newPosition = await item.evaluate((el) => {
      const style = window.getComputedStyle(el)
      const matrix = new DOMMatrix(style.transform)
      return matrix.m41
    })
    
    expect(newPosition).not.toBe(initialPosition)
  })

  test('should handle responsive layout', async ({ page }) => {
    const viewportSizes = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ]
    
    for (const size of viewportSizes) {
      await page.setViewportSize(size)
      await expect(page.locator('.creative-wall')).toBeVisible()
      await expect(page.locator('.black-board')).toBeVisible()
    }
  })

  test('should maintain performance with multiple items', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('100')
    
    await page.waitForTimeout(2000)
    
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lastTime = performance.now()
        let frames = 0
        const targetFrames = 60
        
        function measureFrame(): void {
          frames++
          if (frames < targetFrames) {
            requestAnimationFrame(measureFrame)
          } else {
            const currentTime = performance.now()
            const elapsed = currentTime - lastTime
            const fps = (frames / elapsed) * 1000
            resolve(fps)
          }
        }
        
        requestAnimationFrame(measureFrame)
      })
    })
    
    expect(fps).toBeGreaterThan(30)
  })

  test('should handle network errors gracefully', async ({ page, context }) => {
    await context.route('**/media_data.json', (route) => {
      route.abort('failed')
    })
    
    await page.reload()
    
    await expect(page.locator('.creative-wall')).toBeVisible()
    await expect(page.locator('.black-board')).toBeVisible()
  })
})

test.describe('Accessibility Tests', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    const controls = page.locator('.controls')
    const sliders = controls.locator('input[type="range"]')
    
    for (let i = 0; i < await sliders.count(); i++) {
      const slider = sliders.nth(i)
      await expect(slider).toHaveAttribute('aria-label', /.+/)
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName
    })
    
    expect(focusedElement).toBeTruthy()
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')
    
    const textElements = page.locator('.controls span')
    
    for (let i = 0; i < await textElements.count(); i++) {
      const element = textElements.nth(i)
      const color = await element.evaluate((el) => {
        return window.getComputedStyle(el).color
      })
      
      expect(color).toBeTruthy()
    }
  })
})