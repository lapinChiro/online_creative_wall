import { test, expect } from '@playwright/test'

// Test configuration
test.use({
  // Set timeout for download operations
  actionTimeout: 10000,
  // Use a real browser context for download testing
  acceptDownloads: true
})

test.describe('PNG Download Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for the application to load
    await page.waitForSelector('.controls-container', { state: 'visible', timeout: 10000 })
    await page.waitForSelector('.blackboard', { state: 'visible', timeout: 10000 })
    
    // Wait for images to load (give time for media to be fetched)
    await page.waitForTimeout(2000)
  })
  
  test.describe('Download Button Visibility', () => {
    test('should not show download button when board is not paused', async ({ page }) => {
      // Check that pause button exists
      const pauseButton = page.locator('#pause-button')
      await expect(pauseButton).toBeVisible()
      await expect(pauseButton).toHaveAttribute('aria-pressed', 'false')
      
      // Check that download button does not exist
      const downloadButton = page.locator('.download-button')
      await expect(downloadButton).toBeHidden()
    })
    
    test('should show download button when board is paused', async ({ page }) => {
      // Click pause button
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Verify board is paused
      await expect(pauseButton).toHaveAttribute('aria-pressed', 'true')
      
      // Check that download button appears
      const downloadButton = page.locator('.download-button')
      await expect(downloadButton).toBeVisible()
      await expect(downloadButton).toHaveText(/PNG保存/)
    })
    
    test('should hide download button when board is resumed', async ({ page }) => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Verify download button is visible
      const downloadButton = page.locator('.download-button')
      await expect(downloadButton).toBeVisible()
      
      // Resume the board
      await pauseButton.click()
      
      // Verify download button is hidden
      await expect(downloadButton).toBeHidden()
    })
  })
  
  test.describe('Download Functionality', () => {
    test('should download PNG file when download button is clicked', async ({ browser }) => {
      // Create a new context with download handling
      const context = await browser.newContext({
        acceptDownloads: true
      })
      const page = await context.newPage()
      
      // Navigate and wait for load
      await page.goto('/')
      await page.waitForSelector('.controls-container', { state: 'visible' })
      await page.waitForTimeout(2000)
      
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Setup download promise before clicking
      const downloadPromise = page.waitForEvent('download')
      
      // Click download button
      const downloadButton = page.locator('.download-button')
      await downloadButton.click()
      
      // Wait for download to complete
      const download = await downloadPromise
      
      // Verify download properties
      expect(download.suggestedFilename()).toMatch(/^creative-wall-\d{8}-\d{6}\.png$/)
      
      // Optionally save to a temp location and verify
      const path = await download.path()
      expect(path).toBeTruthy()
      
      await context.close()
    })
    
    test('should show loading state during capture', async () => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Click download button
      const downloadButton = page.locator('.download-button')
      
      // Start download
      await downloadButton.click()
      
      // Check loading state (should be disabled and show loading text)
      await expect(downloadButton).toBeDisabled()
      await expect(downloadButton).toHaveText(/処理中/)
      
      // Wait for completion (should re-enable)
      await expect(downloadButton).toBeEnabled({ timeout: 5000 })
      await expect(downloadButton).toHaveText(/PNG保存/)
    })
  })
  
  test.describe('Success Notification', () => {
    test('should show success notification after successful download', async () => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Click download button
      const downloadButton = page.locator('.download-button')
      await downloadButton.click()
      
      // Check success notification appears
      const notification = page.locator('.success-notification')
      await expect(notification).toBeVisible()
      await expect(notification).toContainText('画像を保存しました')
      
      // Verify notification auto-hides after 3 seconds
      await expect(notification).not.toBeVisible({ timeout: 4000 })
    })
    
    test('should allow manual close of notification', async () => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Click download button
      const downloadButton = page.locator('.download-button')
      await downloadButton.click()
      
      // Wait for success notification
      const notification = page.locator('.success-notification')
      await expect(notification).toBeVisible()
      
      // Click close button
      const closeButton = notification.locator('.notification-close')
      await closeButton.click()
      
      // Verify notification is immediately hidden
      await expect(notification).toBeHidden()
    })
  })
  
  test.describe('Keyboard Accessibility', () => {
    test('should trigger download with Enter key', async () => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Focus download button
      const downloadButton = page.locator('.download-button')
      await downloadButton.focus()
      
      // Press Enter
      await page.keyboard.press('Enter')
      
      // Check that download was triggered (button becomes disabled)
      await expect(downloadButton).toBeDisabled()
      
      // Wait for completion
      await expect(downloadButton).toBeEnabled({ timeout: 5000 })
    })
    
    test('should trigger download with Space key', async () => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Focus download button
      const downloadButton = page.locator('.download-button')
      await downloadButton.focus()
      
      // Press Space
      await page.keyboard.press('Space')
      
      // Check that download was triggered (button becomes disabled)
      await expect(downloadButton).toBeDisabled()
      
      // Wait for completion
      await expect(downloadButton).toBeEnabled({ timeout: 5000 })
    })
    
    test('should be keyboard navigable', async () => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Tab to download button
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab') // May need multiple tabs depending on focus order
      
      // Check download button has focus
      const downloadButton = page.locator('.download-button')
      await expect(downloadButton).toBeFocused()
    })
  })
  
  test.describe('ARIA Attributes', () => {
    test('should have proper ARIA attributes on download button', async () => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Check ARIA attributes
      const downloadButton = page.locator('.download-button')
      await expect(downloadButton).toHaveAttribute('role', 'button')
      await expect(downloadButton).toHaveAttribute('aria-label', '画像をダウンロード')
      await expect(downloadButton).toHaveAttribute('tabindex', '0')
    })
    
    test('should have proper ARIA attributes on notifications', async () => {
      // Pause and trigger download
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      const downloadButton = page.locator('.download-button')
      await downloadButton.click()
      
      // Check notification ARIA attributes
      const notification = page.locator('.notification')
      await expect(notification).toHaveAttribute('role', 'alert')
      await expect(notification).toHaveAttribute('aria-live', 'polite')
    })
  })
  
  test.describe('Error Handling', () => {
    test.skip('should handle timeout gracefully', () => {
      // This test would require mocking a slow response or network issues
      // For now, we'll skip implementation as it requires backend changes
    })
    
    test.skip('should handle CORS errors gracefully', () => {
      // This test would require serving images without proper CORS headers
      // For now, we'll skip implementation as it requires backend changes
    })
  })
  
  test.describe('Visual Regression', () => {
    test('download button should match visual snapshot', async () => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Take screenshot of download button
      const downloadButton = page.locator('.download-button')
      await expect(downloadButton).toHaveScreenshot('download-button.png')
    })
    
    test('success notification should match visual snapshot', async () => {
      // Pause and trigger download
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      const downloadButton = page.locator('.download-button')
      await downloadButton.click()
      
      // Take screenshot of notification
      const notification = page.locator('.success-notification')
      await expect(notification).toHaveScreenshot('success-notification.png')
    })
  })
  
  test.describe('Performance', () => {
    test('should complete download within 3 seconds', async () => {
      // Pause the board
      const pauseButton = page.locator('#pause-button')
      await pauseButton.click()
      
      // Measure download time
      const startTime = Date.now()
      
      const downloadButton = page.locator('.download-button')
      await downloadButton.click()
      
      // Wait for button to re-enable (download complete)
      await expect(downloadButton).toBeEnabled({ timeout: 3000 })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete within 3 seconds
      expect(duration).toBeLessThan(3000)
    })
  })
})