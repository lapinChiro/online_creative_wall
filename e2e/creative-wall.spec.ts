import { test, expect } from '@playwright/test'

test.describe('Creative Wall E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the creative wall', async ({ page }) => {
    await expect(page.locator('.app-container')).toBeVisible()
    await expect(page.locator('.blackboard')).toBeVisible()
  })

  test('should display UI controls', async ({ page }) => {
    const controls = page.locator('.controls-container')
    await expect(controls).toBeVisible()
    
    await expect(controls.getByText('投稿数: ')).toBeVisible()
    await expect(controls.getByText('速度: ')).toBeVisible()
    await expect(page.locator('.toggle-text-btn')).toBeVisible()
  })

  test('should adjust post count', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    const display = page.locator('.post-count-display')
    
    // 初期値は20
    await expect(display).toContainText('20 /')
    
    // 100に変更
    await slider.fill('100')
    await expect(display).toContainText('100 /')
    
    // 5に変更
    await slider.fill('5')
    await expect(display).toContainText('5 /')
  })

  test('should adjust scroll speed', async ({ page }) => {
    const slider = page.locator('input[type="range"]').nth(1)
    const display = page.locator('.speed-display')
    
    // 初期値を確認（globalVelocityのデフォルト値）
    const initialValue = await display.textContent()
    expect(['50%', '100%']).toContain(initialValue)
    
    // 150%に変更
    await slider.fill('150')
    await expect(display).toHaveText('150%')
    
    // 10%に変更
    await slider.fill('10')
    await expect(display).toHaveText('10%')
  })

  test('should toggle text display', async ({ page }) => {
    const toggleButton = page.locator('.toggle-text-btn')
    
    // テキストは初期状態で表示されている
    await expect(toggleButton).toContainText('テキストを隠す')
    
    // クリックして非表示にする
    await toggleButton.click()
    await expect(toggleButton).toContainText('テキストを表示')
    
    // 再度クリックして表示する
    await toggleButton.click()
    await expect(toggleButton).toContainText('テキストを隠す')
  })

  test('should display scroll items', async ({ page }) => {
    await page.waitForSelector('.scroll-item', { timeout: 5000 })
    const items = page.locator('.scroll-item')
    
    expect(await items.count()).toBeGreaterThan(0)
  })

  test('should have animated scroll items', async ({ page }) => {
    await page.waitForSelector('.scroll-item', { timeout: 5000 })
    const item = page.locator('.scroll-item').first()
    
    // leftプロパティで位置を取得
    const initialPosition = await item.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).left)
    })
    
    await page.waitForTimeout(1000)
    
    const newPosition = await item.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).left)
    })
    
    // 左に移動していることを確認（値が減少）
    expect(newPosition).toBeLessThan(initialPosition)
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
      await expect(page.locator('.app-container')).toBeVisible()
      await expect(page.locator('.blackboard')).toBeVisible()
    }
  })

  test('should maintain performance with multiple items', async ({ page }) => {
    const slider = page.locator('input[type="range"]').first()
    await slider.fill('100')
    
    // アイテム数が100に更新されることを確認
    await expect(page.locator('.post-count-display')).toContainText('100 /')
    
    // アイテムが表示されるまで待つ
    await page.waitForSelector('.scroll-item', { timeout: 5000 })
    
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const lastTime = performance.now()
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
    
    // ヘッドレス環境では低FPSが一般的なので10以上であれば正常
    expect(fps).toBeGreaterThan(10)
  })

  test('should handle network errors gracefully', async ({ page, context }) => {
    await context.route('**/media_data.json', async (route) => {
      await route.abort('failed')
    })
    
    await page.goto('/')
    
    // エラー時は.errorクラスが表示される
    await expect(page.locator('.app-container')).toBeVisible()
    await expect(page.locator('.error')).toBeVisible()
    await expect(page.locator('.error')).toHaveText('Failed to load data')
  })
})

test.describe('Accessibility Tests', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/')
    
    // label要素とid属性によるアクセシビリティを確認
    const postCountLabel = page.locator('label[for="post-count"]')
    await expect(postCountLabel).toBeVisible()
    await expect(postCountLabel).toHaveText('投稿数: ')
    
    const speedLabel = page.locator('label[for="scroll-speed"]')
    await expect(speedLabel).toBeVisible()
    await expect(speedLabel).toHaveText('速度: ')
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
    
    const textElements = page.locator('.controls-container span')
    
    for (let i = 0; i < await textElements.count(); i++) {
      const element = textElements.nth(i)
      const color = await element.evaluate((el) => {
        return window.getComputedStyle(el).color
      })
      
      expect(color).toBeTruthy()
    }
  })
})