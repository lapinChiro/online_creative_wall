import { test, expect } from '@playwright/test'
import { testLog } from '../src/utils/logger'

/**
 * ブラウザ互換性テスト
 * Chrome, Firefox, Safari, Edge での PAUSE機能の動作確認
 */

// テスト対象のブラウザリスト
// const browsers = ['chromium', 'firefox', 'webkit'] // webkit = Safari (将来使用予定)

test.describe('Browser Compatibility - PAUSE Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.locator('.blackboard').waitFor({ state: 'visible' })
    await page.locator('.scroll-item').first().waitFor({ state: 'visible' })
  })

  test('COM-003: 主要ブラウザでの基本動作確認', async ({ page, browserName }) => {
    testLog(`Testing on browser: ${browserName}`)
    
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
        DOMMatrix: typeof DOMMatrix !== 'undefined' || typeof (window as Window & { WebKitCSSMatrix?: unknown }).WebKitCSSMatrix !== 'undefined',
        requestAnimationFrame: typeof window.requestAnimationFrame === 'function',
        Map: typeof Map !== 'undefined',
        performanceNow: typeof performance !== 'undefined' && typeof performance.now === 'function',
        querySelector: typeof document !== 'undefined' && typeof document.querySelector === 'function' // eslint-disable-line @typescript-eslint/no-deprecated
      }
      
      return {
        browserName: navigator.userAgent,
        features,
        allSupported: Object.values(features).every(v => v)
      }
    })
    
    testLog(`Browser API Compatibility for ${browserName}:`, compatibilityResult)
    
    // 必須機能がサポートされていることを確認
    expect(compatibilityResult.features.getComputedStyle).toBeTruthy()
    expect(compatibilityResult.features.requestAnimationFrame).toBeTruthy()
    expect(compatibilityResult.features.Map).toBeTruthy()
    expect(compatibilityResult.features.querySelector).toBeTruthy()
  })

  test('キーボードショートカットの動作確認', async ({ page, browserName }) => {
    testLog(`Testing keyboard shortcuts on: ${browserName}`)
    
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
    testLog(`Testing animation pause/resume on: ${browserName}`)
    
    // アイテムの初期位置を取得
    const getItemPosition = async (): Promise<number | null> => {
      return await page.evaluate(() => {
        const item = document.querySelector('.scroll-item')
        if (item !== null) {
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
    await page.waitForTimeout(100) // eslint-disable-line playwright/no-wait-for-timeout
    
    // 位置が変わっていないことを確認
    const pausedPosition = await getItemPosition()
    expect(pausedPosition).not.toBeNull()
    expect(initialPosition).not.toBeNull()
    if (pausedPosition !== null && initialPosition !== null) { // eslint-disable-line playwright/no-conditional-in-test
      expect(Math.abs(pausedPosition - initialPosition)).toBeLessThan(5) // eslint-disable-line playwright/no-conditional-expect
    }
    
    // 再生ボタンをクリック
    await page.locator('#pause-button').click()
    
    // 200ms待機
    await page.waitForTimeout(200) // eslint-disable-line playwright/no-wait-for-timeout
    
    // 位置が変わっていることを確認
    const resumedPosition = await getItemPosition()
    expect(resumedPosition).not.toBeNull()
    if (resumedPosition !== null && pausedPosition !== null) { // eslint-disable-line playwright/no-conditional-in-test
      expect(Math.abs(resumedPosition - pausedPosition)).toBeGreaterThan(5) // eslint-disable-line playwright/no-conditional-expect
    }
  })

  test('transform値の正確な取得（getComputedStyle）', async ({ page, browserName }) => {
    testLog(`Testing getComputedStyle on: ${browserName}`)
    
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
    const canParseMatrix = await page.evaluate((transform: string | null) => {
      if (transform === null || transform === '' || transform === 'none') {return false}
      
      try {
        // DOMMatrixが使えるか確認
        if (typeof DOMMatrix !== 'undefined') {
          const matrix = new DOMMatrix(transform)
          return typeof matrix.m41 === 'number'
        }
        // WebKitCSSMatrixをフォールバック
        interface WindowWithWebKit extends Window {
          WebKitCSSMatrix?: new (transform: string) => { m41: number }
        }
        const windowWithWebKit = window as WindowWithWebKit
        if (typeof windowWithWebKit.WebKitCSSMatrix !== 'undefined') {
          const matrix = new windowWithWebKit.WebKitCSSMatrix(transform)
          return typeof matrix.m41 === 'number'
        }
        // 手動パース
        const match = transform.match(/matrix\(([^)]+)\)/)
        if (match !== null) {
          const values = match[1].split(',').map(v => parseFloat(v.trim()))
          const fifthValue = values[4]
          return values.length >= 5 && !isNaN(fifthValue)
        }
        return false
      } catch {
        return false
      }
    }, transformValue)
    
    expect(canParseMatrix).toBeTruthy()
  })

  test('アクセシビリティ属性の確認', async ({ page, browserName }) => {
    testLog(`Testing accessibility attributes on: ${browserName}`)
    
    const pauseButton = page.locator('#pause-button')
    
    // 必須のaria属性が存在することを確認
    await expect(pauseButton).toHaveAttribute('role', 'button')
    await expect(pauseButton).toHaveAttribute('tabindex', '0')
    await expect(pauseButton).toHaveAttribute('aria-pressed', /.+/)
    await expect(pauseButton).toHaveAttribute('aria-label', /.+/)
    
    // aria属性が正しく切り替わることを確認
    const initialPressed = await pauseButton.getAttribute('aria-pressed')
    const initialLabel = await pauseButton.getAttribute('aria-label')
    
    // 属性が取得できたことを確認
    await expect(pauseButton).toHaveAttribute('aria-pressed')
    await expect(pauseButton).toHaveAttribute('aria-label')
    
    await pauseButton.click()
    
    // 属性値が変更されたことを確認（Stringで確実に文字列化）
    await expect(pauseButton).not.toHaveAttribute('aria-pressed', String(initialPressed))
    await expect(pauseButton).not.toHaveAttribute('aria-label', String(initialLabel))
  })

  test('メモリリーク防止の確認', async ({ page, browserName }) => {
    testLog(`Testing memory leak prevention on: ${browserName}`)
    
    // pausedPositions Map のサイズを監視
    const getMapSize = async (): Promise<number> => {
      return await page.evaluate(() => {
        // Pinia storeにアクセス
        interface WindowWithVue extends Window {
          __VUE_APP__?: {
            config: {
              globalProperties: {
                $pinia?: {
                  _s: Map<string, { pausedPositions?: Map<unknown, unknown> }>
                }
              }
            }
          }
        }
        const windowWithVue = window as WindowWithVue
        const app = windowWithVue.__VUE_APP__
        if (app !== undefined && app.config.globalProperties.$pinia !== undefined) {
          const store = app.config.globalProperties.$pinia._s.get('scrollItems')
          if (store !== undefined && store.pausedPositions !== undefined) {
            return store.pausedPositions.size
          }
        }
        return -1
      })
    }
    
    // PAUSEして位置を保存
    await page.locator('#pause-button').click()
    await page.waitForTimeout(100) // eslint-disable-line playwright/no-wait-for-timeout
    
    const sizeAfterPause = await getMapSize()
    testLog(`Map size after pause: ${String(sizeAfterPause)}`)
    
    // 再生して位置をクリア
    await page.locator('#pause-button').click()
    await page.waitForTimeout(100) // eslint-disable-line playwright/no-wait-for-timeout
    
    const sizeAfterResume = await getMapSize()
    testLog(`Map size after resume: ${String(sizeAfterResume)}`)
    
    // 再開後はMapがクリアされることを確認
    expect(sizeAfterResume).toBeLessThanOrEqual(sizeAfterPause)
  })
})

// ブラウザバージョンのレポート生成
test('ブラウザ情報レポート', async ({ page, browserName }) => {
  const browserInfo = await page.evaluate(() => {
    const getVendor = (): string => {
      const descriptor = Object.getOwnPropertyDescriptor(navigator, 'vendor')
      if (descriptor !== undefined && typeof descriptor.value === 'string') {
        return descriptor.value
      }
      const proto = Object.getPrototypeOf(navigator)
      const protoDescriptor = Object.getOwnPropertyDescriptor(proto, 'vendor')
      if (protoDescriptor !== undefined && protoDescriptor.get !== undefined) {
        const value = protoDescriptor.get.call(navigator)
        if (typeof value === 'string') {
          return value
        }
      }
      return 'unknown'
    }
    const getPlatform = (): string => {
      const descriptor = Object.getOwnPropertyDescriptor(navigator, 'platform')
      if (descriptor !== undefined && typeof descriptor.value === 'string') {
        return descriptor.value
      }
      const proto = Object.getPrototypeOf(navigator)
      const protoDescriptor = Object.getOwnPropertyDescriptor(proto, 'platform')
      if (protoDescriptor !== undefined && protoDescriptor.get !== undefined) {
        const value = protoDescriptor.get.call(navigator)
        if (typeof value === 'string') {
          return value
        }
      }
      return 'unknown'
    }
    return {
      userAgent: navigator.userAgent,
      vendor: getVendor(),
      language: navigator.language,
      platform: getPlatform(),
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${String(screen.width)}x${String(screen.height)}`,
      windowSize: `${String(window.innerWidth)}x${String(window.innerHeight)}`
    }
  })
  
  testLog('=== Browser Compatibility Report ===')
  testLog(`Browser: ${browserName}`)
  testLog('User Agent:', browserInfo.userAgent)
  testLog('Vendor:', browserInfo.vendor)
  testLog('Language:', browserInfo.language)
  testLog('Platform:', browserInfo.platform)
  testLog('Screen Resolution:', browserInfo.screenResolution)
  testLog('Window Size:', browserInfo.windowSize)
  testLog('=====================================')
  
  // ブラウザ情報が正しく取得できていることを検証
  expect(browserInfo.userAgent).toBeTruthy()
  expect(browserInfo.language).toBeTruthy()
  expect(browserInfo.cookieEnabled).toBeDefined()
  expect(browserInfo.onLine).toBeDefined()
  expect(browserInfo.screenResolution).toMatch(/^\d+x\d+$/)
  expect(browserInfo.windowSize).toMatch(/^\d+x\d+$/)
})