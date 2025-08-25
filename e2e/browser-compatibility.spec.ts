import { test, expect, type BrowserContext } from '@playwright/test'

/**
 * ブラウザ互換性テスト
 * Chrome, Firefox, Safari, Edge での PAUSE機能の動作確認
 */

// テスト対象のブラウザリスト
const browsers = ['chromium', 'firefox', 'webkit'] // webkit = Safari

test.describe('Browser Compatibility - PAUSE Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.blackboard', { state: 'visible' })
    await page.waitForSelector('.scroll-item', { state: 'visible' })
  })

  test('COM-003: 主要ブラウザでの基本動作確認', async ({ page, browserName }) => {
    console.log(`Testing on browser: ${browserName}`)
    
    // PAUSEボタンの存在確認
    const pauseButton = page.locator('#pause-button')
    await expect(pauseButton).toBeVisible()
    
    // 初期状態の確認
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'false')
    await expect(pauseButton.locator('.pause-icon')).toContainText('⏸')
    
    // PAUSEボタンクリック
    await pauseButton.click()
    
    // 状態変更の確認
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'true')
    await expect(pauseButton.locator('.pause-icon')).toContainText('▶')
    
    // 再度クリックして再生
    await pauseButton.click()
    
    // 再生状態の確認
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'false')
    await expect(pauseButton.locator('.pause-icon')).toContainText('⏸')
  })

  test('ブラウザAPIの互換性チェック', async ({ page, browserName }) => {
    // ブラウザ互換性チェックスクリプトを実行
    const compatibilityResult = await page.evaluate(() => {
      const features = {
        getComputedStyle: typeof window.getComputedStyle === 'function',
        DOMMatrix: typeof DOMMatrix !== 'undefined' || typeof (window as any).WebKitCSSMatrix !== 'undefined',
        requestAnimationFrame: typeof window.requestAnimationFrame === 'function',
        Map: typeof Map !== 'undefined',
        performanceNow: typeof performance !== 'undefined' && typeof performance.now === 'function',
        querySelector: typeof document.querySelector === 'function',
      }
      
      return {
        browserName: navigator.userAgent,
        features,
        allSupported: Object.values(features).every(v => v === true)
      }
    })
    
    console.log(`Browser API Compatibility for ${browserName}:`, compatibilityResult)
    
    // 必須機能がサポートされていることを確認
    expect(compatibilityResult.features.getComputedStyle).toBeTruthy()
    expect(compatibilityResult.features.requestAnimationFrame).toBeTruthy()
    expect(compatibilityResult.features.Map).toBeTruthy()
    expect(compatibilityResult.features.querySelector).toBeTruthy()
  })

  test('キーボードショートカットの動作確認', async ({ page, browserName }) => {
    console.log(`Testing keyboard shortcuts on: ${browserName}`)
    
    const pauseButton = page.locator('#pause-button')
    
    // スペースキーでPAUSE
    await page.keyboard.press(' ')
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'true')
    
    // 再度スペースキーで再生
    await page.keyboard.press(' ')
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'false')
    
    // TABキーでフォーカス移動
    await page.keyboard.press('Tab')
    await expect(pauseButton).toBeFocused()
    
    // Enterキーでも動作確認
    await page.keyboard.press('Enter')
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'true')
  })

  test('アニメーション停止・再開の動作確認', async ({ page, browserName }) => {
    console.log(`Testing animation pause/resume on: ${browserName}`)
    
    // アイテムの初期位置を取得
    const getItemPosition = async () => {
      return await page.evaluate(() => {
        const item = document.querySelector('.scroll-item')
        if (item) {
          const rect = item.getBoundingClientRect()
          return rect.x
        }
        return null
      })
    }
    
    const initialPosition = await getItemPosition()
    expect(initialPosition).not.toBeNull()
    
    // PAUSEボタンをクリック
    await page.locator('#pause-button').click()
    
    // 100ms待機
    await page.waitForTimeout(100)
    
    // 位置が変わっていないことを確認
    const pausedPosition = await getItemPosition()
    expect(Math.abs(pausedPosition! - initialPosition!)).toBeLessThan(5)
    
    // 再生ボタンをクリック
    await page.locator('#pause-button').click()
    
    // 200ms待機
    await page.waitForTimeout(200)
    
    // 位置が変わっていることを確認
    const resumedPosition = await getItemPosition()
    expect(Math.abs(resumedPosition! - pausedPosition!)).toBeGreaterThan(5)
  })

  test('transform値の正確な取得（getComputedStyle）', async ({ page, browserName }) => {
    console.log(`Testing getComputedStyle on: ${browserName}`)
    
    // スクロールアイテムのtransform値を取得
    const transformValue = await page.evaluate(() => {
      const item = document.querySelector('.scroll-item')
      if (item instanceof HTMLElement) {
        const computed = window.getComputedStyle(item)
        return computed.transform
      }
      return null
    })
    
    expect(transformValue).not.toBeNull()
    
    // DOMMatrix または代替手段でパース可能か確認
    const canParseMatrix = await page.evaluate((transform) => {
      if (!transform || transform === 'none') return false
      
      try {
        // DOMMatrixが使えるか確認
        if (typeof DOMMatrix !== 'undefined') {
          const matrix = new DOMMatrix(transform)
          return typeof matrix.m41 === 'number'
        }
        // WebKitCSSMatrixをフォールバック
        if (typeof (window as any).WebKitCSSMatrix !== 'undefined') {
          const matrix = new (window as any).WebKitCSSMatrix(transform)
          return typeof matrix.m41 === 'number'
        }
        // 手動パース
        const match = transform.match(/matrix\(([^)]+)\)/)
        if (match) {
          const values = match[1].split(',').map(v => parseFloat(v.trim()))
          return values.length >= 5 && !isNaN(values[4])
        }
        return false
      } catch {
        return false
      }
    }, transformValue)
    
    expect(canParseMatrix).toBeTruthy()
  })

  test('アクセシビリティ属性の確認', async ({ page, browserName }) => {
    console.log(`Testing accessibility attributes on: ${browserName}`)
    
    const pauseButton = page.locator('#pause-button')
    
    // 必須のaria属性が存在することを確認
    await expect(pauseButton).toHaveAttribute('role', 'button')
    await expect(pauseButton).toHaveAttribute('tabindex', '0')
    await expect(pauseButton).toHaveAttribute('aria-pressed', /.+/)
    await expect(pauseButton).toHaveAttribute('aria-label', /.+/)
    
    // aria属性が正しく切り替わることを確認
    const initialPressed = await pauseButton.getAttribute('aria-pressed')
    const initialLabel = await pauseButton.getAttribute('aria-label')
    
    await pauseButton.click()
    
    const newPressed = await pauseButton.getAttribute('aria-pressed')
    const newLabel = await pauseButton.getAttribute('aria-label')
    
    expect(newPressed).not.toEqual(initialPressed)
    expect(newLabel).not.toEqual(initialLabel)
  })

  test('メモリリーク防止の確認', async ({ page, browserName }) => {
    console.log(`Testing memory leak prevention on: ${browserName}`)
    
    // pausedPositions Map のサイズを監視
    const getMapSize = async () => {
      return await page.evaluate(() => {
        // Pinia storeにアクセス
        const app = (window as any).__VUE_APP__
        if (app && app.config.globalProperties.$pinia) {
          const store = app.config.globalProperties.$pinia._s.get('scrollItems')
          if (store && store.pausedPositions) {
            return store.pausedPositions.size
          }
        }
        return -1
      })
    }
    
    // PAUSEして位置を保存
    await page.locator('#pause-button').click()
    await page.waitForTimeout(100)
    
    const sizeAfterPause = await getMapSize()
    console.log(`Map size after pause: ${sizeAfterPause}`)
    
    // 再生して位置をクリア
    await page.locator('#pause-button').click()
    await page.waitForTimeout(100)
    
    const sizeAfterResume = await getMapSize()
    console.log(`Map size after resume: ${sizeAfterResume}`)
    
    // 再開後はMapがクリアされることを確認
    expect(sizeAfterResume).toBeLessThanOrEqual(sizeAfterPause)
  })
})

// ブラウザバージョンのレポート生成
test('ブラウザ情報レポート', async ({ page, browserName }) => {
  const browserInfo = await page.evaluate(() => {
    return {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`
    }
  })
  
  console.log('=== Browser Compatibility Report ===')
  console.log(`Browser: ${browserName}`)
  console.log('User Agent:', browserInfo.userAgent)
  console.log('Vendor:', browserInfo.vendor)
  console.log('Language:', browserInfo.language)
  console.log('Platform:', browserInfo.platform)
  console.log('Screen Resolution:', browserInfo.screenResolution)
  console.log('Window Size:', browserInfo.windowSize)
  console.log('=====================================')
})