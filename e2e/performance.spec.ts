import { test, expect, type Page } from '@playwright/test'
import { testLog } from '../src/utils/logger'

/**
 * E2Eパフォーマンステスト
 * 実際の使用シナリオでパフォーマンスを測定
 */

// パフォーマンスメトリクスの型定義
interface PerformanceMetrics {
  fps: number
  memoryUsage: number
  domNodes: number
  jsHeapSize: number
  renderTime: number
  scriptDuration: number
}

// FPSとメモリ使用量を測定するヘルパー関数
async function measurePerformance(page: Page, duration: number = 5000): Promise<PerformanceMetrics> {
  // パフォーマンス測定開始
  const metrics = await page.evaluate(async (measureDuration) => {
    const results = {
      fps: [] as number[],
      memoryUsage: 0,
      domNodes: 0,
      jsHeapSize: 0,
      renderTime: 0,
      scriptDuration: 0
    }
    
    // FPS測定
    let lastTime = performance.now()
    let frameCount = 0
    const fpsValues: number[] = []
    
    const measureFPS = (): void => {
      const currentTime = performance.now()
      frameCount++
      
      if (currentTime - lastTime >= 1000) {
        fpsValues.push(frameCount)
        frameCount = 0
        lastTime = currentTime
      }
      
      if (currentTime < measureDuration) {
        requestAnimationFrame(measureFPS)
      }
    }
    
    requestAnimationFrame(measureFPS)
    
    // 測定期間待機
    await new Promise(resolve => setTimeout(resolve, measureDuration))
    
    // DOM ノード数を取得
    results.domNodes = document.querySelectorAll('*').length
    
    // メモリ使用量を取得（Chrome専用）
    interface PerformanceMemory {
      usedJSHeapSize: number
      totalJSHeapSize: number
    }
    const perf = performance as Performance & { memory?: PerformanceMemory }
    if (perf.memory !== undefined) {
      results.jsHeapSize = perf.memory.usedJSHeapSize / 1048576 // MB
      results.memoryUsage = perf.memory.totalJSHeapSize / 1048576 // MB
    }
    
    // レンダリング時間を取得
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcpEntry !== undefined) {
      results.renderTime = fcpEntry.startTime
    }
    
    // スクリプト実行時間を取得
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    if (navigationEntries.length > 0) {
      results.scriptDuration = navigationEntries[0].loadEventEnd - navigationEntries[0].domContentLoadedEventStart
    }
    
    // 平均FPSを計算
    const avgFps = fpsValues.length > 0 
      ? fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length 
      : 0
    
    return {
      fps: avgFps,
      memoryUsage: results.memoryUsage,
      domNodes: results.domNodes,
      jsHeapSize: results.jsHeapSize,
      renderTime: results.renderTime,
      scriptDuration: results.scriptDuration
    }
  }, duration)
  
  return metrics
}

test.describe('Creative Wall パフォーマンステスト', () => {
  test.beforeEach(async ({ page }) => {
    // パフォーマンス測定を有効化
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
  })
  
  test('初期ロードパフォーマンス', async ({ page }) => {
    const startTime = Date.now()
    
    // ページリロードして測定
    await page.reload()
    await page.waitForSelector('.wall-container', { timeout: 10000 })
    
    const loadTime = Date.now() - startTime
    
    // パフォーマンスメトリクスを取得
    const metrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (entries.length > 0) {
        return {
          domContentLoaded: entries[0].domContentLoadedEventEnd - entries[0].domContentLoadedEventStart,
          loadComplete: entries[0].loadEventEnd - entries[0].loadEventStart,
          domInteractive: entries[0].domInteractive,
          transferSize: entries[0].transferSize
        }
      }
      return null
    })
    
    testLog('📊 初期ロードパフォーマンス:')
    testLog(`  - 総ロード時間: ${String(loadTime)}ms`)
    if (metrics !== null) {
      testLog(`  - DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`)
      testLog(`  - Load Complete: ${metrics.loadComplete.toFixed(2)}ms`)
      testLog(`  - DOM Interactive: ${metrics.domInteractive.toFixed(2)}ms`)
      testLog(`  - Transfer Size: ${(metrics.transferSize / 1024).toFixed(2)}KB`)
    }
    
    // アサーション
    expect(loadTime).toBeLessThan(3000) // 3秒以内
  })
  
  test('アニメーションパフォーマンス（50アイテム）', async ({ page }) => {
    // 50アイテムに設定
    await page.locator('#post-count').fill('50')
    // 50アイテムが生成されるまで待つ
    await page.waitForFunction(() => {
      const items = document.querySelectorAll('.scroll-item')
      return items.length >= 50
    }, { timeout: 3000 })
    
    // 5秒間のパフォーマンスを測定
    testLog('📊 アニメーションパフォーマンス測定中...')
    const metrics = await measurePerformance(page, 5000)
    
    testLog('📊 アニメーションパフォーマンス（50アイテム）:')
    testLog(`  - 平均FPS: ${metrics.fps.toFixed(1)}`)
    testLog(`  - メモリ使用量: ${metrics.memoryUsage.toFixed(2)}MB`)
    testLog(`  - JSヒープサイズ: ${metrics.jsHeapSize.toFixed(2)}MB`)
    testLog(`  - DOMノード数: ${String(metrics.domNodes)}`)
    testLog(`  - レンダリング時間: ${metrics.renderTime.toFixed(2)}ms`)
    testLog(`  - スクリプト実行時間: ${metrics.scriptDuration.toFixed(2)}ms`)
    
    // アサーション（ヘッドレス環境では低FPS想定）
    expect(metrics.fps).toBeGreaterThan(15) // 最低15FPS（ヘッドレス環境対応）
    expect(metrics.memoryUsage).toBeLessThan(150) // 150MB以下
  })
  
  test('高負荷パフォーマンス（100アイテム）', async ({ page }) => {
    // 100アイテムに設定
    await page.locator('#post-count').fill('100')
    // 100アイテムが生成されるまで待つ
    await page.waitForFunction(() => {
      const items = document.querySelectorAll('.scroll-item')
      return items.length >= 100
    }, { timeout: 5000 })
    
    // 5秒間のパフォーマンスを測定
    testLog('📊 高負荷パフォーマンス測定中...')
    const metrics = await measurePerformance(page, 5000)
    
    testLog('📊 高負荷パフォーマンス（100アイテム）:')
    testLog(`  - 平均FPS: ${metrics.fps.toFixed(1)}`)
    testLog(`  - メモリ使用量: ${metrics.memoryUsage.toFixed(2)}MB`)
    testLog(`  - JSヒープサイズ: ${metrics.jsHeapSize.toFixed(2)}MB`)
    testLog(`  - DOMノード数: ${String(metrics.domNodes)}`)
    
    // アサーション（高負荷時はより低いFPS想定）
    expect(metrics.fps).toBeGreaterThan(20) // 最低20FPS（高負荷時）
    expect(metrics.memoryUsage).toBeLessThan(200) // 200MB以下
  })
  
  test('スピード変更パフォーマンス', async ({ page }) => {
    const speeds = [50, 100, 150]
    const results: Record<number, PerformanceMetrics> = {}
    
    for (const speed of speeds) {
      // スピードを設定
      await page.locator('#scroll-speed').fill(speed.toString())
      // スピード値が反映されるまで待つ
      await page.waitForFunction((expectedSpeed) => {
        const speedInput = document.querySelector('#scroll-speed')
        return speedInput instanceof HTMLInputElement && speedInput.value === expectedSpeed.toString()
      }, speed, { timeout: 2000 })
      
      // パフォーマンス測定
      testLog(`📊 スピード ${String(speed)}% で測定中...`)
      results[speed] = await measurePerformance(page, 3000)
    }
    
    testLog('📊 スピード別パフォーマンス:')
    for (const [speed, metrics] of Object.entries(results)) {
      testLog(`  速度 ${speed}%:`)
      testLog(`    - FPS: ${metrics.fps.toFixed(1)}`)
      testLog(`    - メモリ: ${metrics.memoryUsage.toFixed(2)}MB`)
    }
    
    // すべての速度で30FPS以上を維持
    for (const metrics of Object.values(results)) {
      expect(metrics.fps).toBeGreaterThan(30)
    }
  })
  
  test('Virtual Scrolling効果測定', async ({ page }) => {
    // Virtual Scrollingが有効な状態で測定
    await page.locator('#post-count').fill('100')
    await page.waitForTimeout(2000)
    
    // ビューポート内の要素数を確認
    const visibleItems = await page.evaluate(() => {
      const items = document.querySelectorAll('.scroll-item[data-visible="true"]')
      return items.length
    })
    
    // 全アイテム数を確認
    const totalItems = await page.evaluate(() => {
      const items = document.querySelectorAll('.scroll-item')
      return items.length
    })
    
    testLog('📊 Virtual Scrolling効果:')
    testLog(`  - 全アイテム数: ${String(totalItems)}`)
    testLog(`  - 表示アイテム数: ${String(visibleItems)}`)
    testLog(`  - 削減率: ${((1 - visibleItems/100) * 100).toFixed(1)}%`)
    
    // Virtual Scrollingが機能していることを確認
    expect(visibleItems).toBeLessThan(100) // 全アイテムより少ない
    expect(visibleItems).toBeGreaterThan(0) // 表示アイテムが存在する
  })
  
  test('長時間実行安定性テスト', async ({ page }) => {
    test.setTimeout(60000) // タイムアウトを60秒に設定
    
    // 50アイテムで開始
    await page.locator('#post-count').fill('50')
    await page.waitForTimeout(1000)
    
    const measurements: PerformanceMetrics[] = []
    
    // 30秒間、5秒ごとに測定
    testLog('📊 長時間実行テスト開始（30秒）...')
    for (let i = 0; i < 6; i++) {
      const metrics = await measurePerformance(page, 5000)
      measurements.push(metrics)
      testLog(`  ${String((i + 1) * 5)}秒: FPS=${metrics.fps.toFixed(1)}, メモリ=${metrics.memoryUsage.toFixed(2)}MB`)
    }
    
    // メモリリークチェック
    const initialMemory = measurements[0].memoryUsage
    const finalMemory = measurements[measurements.length - 1].memoryUsage
    const memoryIncrease = finalMemory - initialMemory
    
    testLog('📊 安定性テスト結果:')
    testLog(`  - 初期メモリ: ${initialMemory.toFixed(2)}MB`)
    testLog(`  - 最終メモリ: ${finalMemory.toFixed(2)}MB`)
    testLog(`  - メモリ増加: ${memoryIncrease.toFixed(2)}MB`)
    
    // メモリリークがないことを確認（10MB以下の増加）
    expect(memoryIncrease).toBeLessThan(10)
    
    // FPSが安定していることを確認
    const avgFps = measurements.reduce((sum, m) => sum + m.fps, 0) / measurements.length
    expect(avgFps).toBeGreaterThan(45)
  })
})