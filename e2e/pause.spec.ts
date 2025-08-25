import { test, expect, type Page } from '@playwright/test'

// テスト前のセットアップ
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // アプリケーションが完全に読み込まれるまで待機
  await page.locator('.blackboard').waitFor({ state: 'visible' })
  // アイテムが表示されるまで待機
  await page.locator('.scroll-item').first().waitFor({ state: 'visible' })
})

test.describe('PAUSE Functionality', () => {
  test('AC-001: PAUSEボタンクリックで全スクロール停止', async ({ page }) => {
    // 初期状態の確認
    await expect(page.locator('#pause-button')).toBeVisible()
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
    
    // アイテムの初期位置を記録
    const itemsBefore = await getItemPositions(page)
    
    // PAUSEボタンをクリック
    await page.locator('#pause-button').click()
    
    // アイコンが変わったことを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('▶')
    
    // 50ms待機
    await page.waitForTimeout(50) // eslint-disable-line playwright/no-wait-for-timeout
    
    // アイテムの位置を再度取得
    const itemsAfter = await getItemPositions(page)
    
    // 位置が変わっていないことを確認（50ms以内に停止）
    expect(itemsBefore.length).toEqual(itemsAfter.length)
    itemsBefore.forEach((pos, index) => {
      const afterPos = itemsAfter[index]
      const diff = Math.abs(afterPos - pos)
      expect(diff).toBeLessThan(5) // 許容誤差5px以内
    })
  })
  
  test('AC-002: 再生ボタンクリックで停止位置から再開', async ({ page }) => {
    // PAUSEボタンをクリック
    await page.locator('#pause-button').click()
    await page.waitForTimeout(100) // eslint-disable-line playwright/no-wait-for-timeout
    
    // 停止時の位置を記録
    const pausedPositions = await getItemPositions(page)
    
    // 再生ボタンをクリック
    await page.locator('#pause-button').click()
    
    // アイコンが戻ったことを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
    
    // 100ms待機してアニメーションが再開したことを確認
    await page.waitForTimeout(100) // eslint-disable-line playwright/no-wait-for-timeout
    
    const resumedPositions = await getItemPositions(page)
    
    // 位置が変わっていることを確認（アニメーション再開）
    let moved = false
    pausedPositions.forEach((pos, index) => {
      const resumedPos = resumedPositions[index]
      if (Math.abs(resumedPos - pos) > 5) {
        moved = true
      }
    })
    expect(moved).toBeTruthy()
  })
  
  test('AC-003: スペースキー押下でPAUSE/再生切り替え', async ({ page }) => {
    // 初期状態の確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
    
    // スペースキーを押下
    await page.keyboard.press(' ')
    
    // アイコンが変わったことを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('▶')
    
    // 再度スペースキーを押下
    await page.keyboard.press(' ')
    
    // アイコンが戻ったことを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
  })
  
  test('AC-004: アイコン表示が状態に応じて切り替わる', async ({ page }) => {
    // 初期状態：再生中（⏸アイコン）
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
    await expect(page.locator('#pause-button')).toHaveAttribute('aria-pressed', 'false')
    await expect(page.locator('#pause-button')).toHaveAttribute('aria-label', '一時停止')
    
    // PAUSEボタンクリック
    await page.locator('#pause-button').click()
    
    // 一時停止中（▶アイコン）
    await expect(page.locator('#pause-button .pause-icon')).toContainText('▶')
    await expect(page.locator('#pause-button')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('#pause-button')).toHaveAttribute('aria-label', '再生')
    
    // 再度クリック
    await page.locator('#pause-button').click()
    
    // 再生中に戻る
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
    await expect(page.locator('#pause-button')).toHaveAttribute('aria-pressed', 'false')
  })
  
  test('AC-005: 速度調整との共存（独立動作）', async ({ page }) => {
    // PAUSEボタンをクリック
    await page.locator('#pause-button').click()
    await expect(page.locator('#pause-button .pause-icon')).toContainText('▶')
    
    // 速度を変更
    const speedSlider = page.locator('#scroll-speed')
    await speedSlider.fill('100')
    
    // PAUSE状態が維持されていることを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('▶')
    
    // 再生を再開
    await page.locator('#pause-button').click()
    
    // 速度を再度変更
    await speedSlider.fill('50')
    
    // 再生状態が維持されていることを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
  })
  
  test('AC-006: テキスト表示との共存（独立動作）', async ({ page }) => {
    // PAUSEボタンをクリック
    await page.locator('#pause-button').click()
    await expect(page.locator('#pause-button .pause-icon')).toContainText('▶')
    
    // テキスト表示を切り替え
    const textToggle = page.locator('.toggle-text-btn')
    await textToggle.click()
    
    // PAUSE状態が維持されていることを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('▶')
    
    // 再度テキスト表示を切り替え
    await textToggle.click()
    
    // PAUSE状態が維持されていることを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('▶')
  })
  
  test('位置のズレが±5px以内', async ({ page }) => {
    // アイテムの初期位置を記録
    await getItemPositions(page) // 初期位置を確認（使用しない）
    
    // PAUSEボタンをクリック
    await page.locator('#pause-button').click()
    await page.waitForTimeout(100) // eslint-disable-line playwright/no-wait-for-timeout
    
    // 停止時の位置を記録
    const pausedPositions = await getItemPositions(page)
    
    // 再生ボタンをクリック
    await page.locator('#pause-button').click()
    
    // すぐに再度PAUSEボタンをクリック
    await page.locator('#pause-button').click()
    
    // 位置を再度取得
    const finalPositions = await getItemPositions(page)
    
    // 位置のズレが±5px以内であることを確認
    pausedPositions.forEach((pos, index) => {
      const diff = Math.abs(finalPositions[index] - pos)
      expect(diff).toBeLessThanOrEqual(5)
    })
  })
  
  test('アクセシビリティ属性の確認', async ({ page }) => {
    const pauseButton = page.locator('#pause-button')
    
    // role属性
    await expect(pauseButton).toHaveAttribute('role', 'button')
    
    // tabindex属性
    await expect(pauseButton).toHaveAttribute('tabindex', '0')
    
    // aria-pressed属性（初期状態）
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'false')
    
    // aria-label属性（初期状態）
    await expect(pauseButton).toHaveAttribute('aria-label', '一時停止')
    
    // クリック後
    await pauseButton.click()
    
    // aria-pressed属性（PAUSE状態）
    await expect(pauseButton).toHaveAttribute('aria-pressed', 'true')
    
    // aria-label属性（PAUSE状態）
    await expect(pauseButton).toHaveAttribute('aria-label', '再生')
  })
  
  test('キーボードナビゲーション', async ({ page }) => {
    // TABキーでPAUSEボタンにフォーカス
    await page.keyboard.press('Tab')
    
    // PAUSEボタンがフォーカスされていることを確認
    await expect(page.locator('#pause-button')).toBeFocused()
    
    // Enterキーで動作することを確認
    await page.keyboard.press('Enter')
    await expect(page.locator('#pause-button .pause-icon')).toContainText('▶')
    
    // Spaceキーでも動作することを確認
    await page.keyboard.press(' ')
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
  })
  
  test('入力フィールドでスペースキーが無効', async ({ page }) => {
    // 速度調整スライダーにフォーカス
    await page.locator('#scroll-speed').focus()
    
    // スペースキーを押下
    await page.keyboard.press(' ')
    
    // PAUSE状態が変わっていないことを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
    
    // 投稿数スライダーにフォーカス
    await page.locator('#post-count').focus()
    
    // スペースキーを押下
    await page.keyboard.press(' ')
    
    // PAUSE状態が変わっていないことを確認
    await expect(page.locator('#pause-button .pause-icon')).toContainText('⏸')
  })
})

// ヘルパー関数：アイテムの位置を取得
async function getItemPositions(page: Page): Promise<number[]> {
  const items = await page.locator('.scroll-item').all()
  const positions: number[] = []
  
  for (const item of items) {
    const box = await item.boundingBox()
    if (box !== null) {
      positions.push(box.x)
    }
  }
  
  return positions
}