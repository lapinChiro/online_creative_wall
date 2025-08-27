import { test, expect } from '@playwright/test'

test.describe('PNG Download Feature - Core Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for the application to load
    await page.waitForSelector('.controls-container', { state: 'visible', timeout: 10000 })
    await page.waitForSelector('.blackboard', { state: 'visible', timeout: 10000 })
    
    // Wait for initial load
    await page.waitForTimeout(1000)
  })
  
  test('should show download button only when paused', async ({ page }) => {
    // Initially, download button should not be visible
    const downloadButton = page.locator('.download-button')
    await expect(downloadButton).toBeHidden()
    
    // Click pause button
    const pauseButton = page.locator('#pause-button')
    await pauseButton.click()
    
    // Download button should appear
    await expect(downloadButton).toBeVisible()
    await expect(downloadButton).toHaveText(/PNG保存/)
    
    // Resume and button should disappear
    await pauseButton.click()
    await expect(downloadButton).toBeHidden()
  })
  
  test('should handle download process', async ({ page }) => {
    // Pause the board
    const pauseButton = page.locator('#pause-button')
    await pauseButton.click()
    
    // Setup download promise
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 })
    
    // Click download button
    const downloadButton = page.locator('.download-button')
    await downloadButton.click()
    
    // Button should show loading state
    await expect(downloadButton).toBeDisabled()
    await expect(downloadButton).toHaveText(/処理中/)
    
    // Wait for download
    const download = await downloadPromise
    
    // Verify filename format
    expect(download.suggestedFilename()).toMatch(/^creative-wall-\d{8}-\d{6}\.png$/)
    
    // Button should be enabled again
    await expect(downloadButton).toBeEnabled()
    await expect(downloadButton).toHaveText(/PNG保存/)
  })
  
  test('should show success notification', async ({ page }) => {
    // Pause the board
    const pauseButton = page.locator('#pause-button')
    await pauseButton.click()
    
    // Click download button
    const downloadButton = page.locator('.download-button')
    await downloadButton.click()
    
    // Success notification should appear
    const notification = page.locator('.success-notification')
    await expect(notification).toBeVisible()
    await expect(notification).toContainText('画像を保存しました')
    
    // Can close notification manually
    const closeButton = notification.locator('.notification-close')
    await closeButton.click()
    await expect(notification).toBeHidden()
  })
  
  test('should support keyboard shortcuts', async ({ page }) => {
    // Pause the board
    const pauseButton = page.locator('#pause-button')
    await pauseButton.click()
    
    // Focus download button
    const downloadButton = page.locator('.download-button')
    await downloadButton.focus()
    
    // Press Enter to trigger download
    await page.keyboard.press('Enter')
    
    // Button should show loading state
    await expect(downloadButton).toBeDisabled()
    
    // Wait for completion
    await expect(downloadButton).toBeEnabled({ timeout: 5000 })
  })
  
  test('should have proper accessibility attributes', async ({ page }) => {
    // Pause the board
    const pauseButton = page.locator('#pause-button')
    await pauseButton.click()
    
    // Check ARIA attributes on download button
    const downloadButton = page.locator('.download-button')
    await expect(downloadButton).toHaveAttribute('role', 'button')
    await expect(downloadButton).toHaveAttribute('aria-label', '画像をダウンロード')
    await expect(downloadButton).toHaveAttribute('tabindex', '0')
  })
})