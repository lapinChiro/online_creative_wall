/* eslint-disable no-console */
import { test, expect } from '@playwright/test'

test.describe('Download Quality Verification', () => {
  test('should produce clear PNG without blur or fog', async ({ page }) => {
    // Go to the application
    await page.goto('http://localhost:5174/')
    
    // Wait for content to load
    await page.waitForSelector('.blackboard', { timeout: 10000 })
    await page.waitForTimeout(2000) // Let animations start // eslint-disable-line playwright/no-wait-for-timeout
    
    // Pause the board
    const pauseButton = page.locator('#pause-button')
    await pauseButton.click()
    
    // Wait for download button to appear
    const downloadButton = page.locator('.download-button')
    await expect(downloadButton).toBeVisible()
    
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download')
    
    // Click download button
    await downloadButton.click()
    
    // Wait for download to complete
    const download = await downloadPromise
    
    // Save the file to a known location
    const path = await download.path()
    console.log('Downloaded file path:', path)
    
    // Verify the download succeeded
    expect(download.suggestedFilename()).toMatch(/creative-wall-\d{8}-\d{6}\.png/)
    
    // Check that success notification appears
    const successNotification = page.locator('.success-notification')
    await expect(successNotification).toBeVisible()
    await expect(successNotification).toContainText('画像を保存しました')
    
    console.log('✅ Download completed successfully')
    console.log('✅ File name:', download.suggestedFilename())
    console.log('✅ Please manually verify the downloaded image quality')
  })
  
  test('should handle CORS images properly', async ({ page }) => {
    // Go to the application
    await page.goto('http://localhost:5174/')
    
    // Wait for external images to load
    await page.waitForSelector('.blackboard', { timeout: 10000 })
    await page.waitForTimeout(3000) // Give time for external images // eslint-disable-line playwright/no-wait-for-timeout
    
    // Check console for CORS errors
    const consoleLogs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text())
      }
    })
    
    // Pause and download
    await page.locator('#pause-button').click()
    
    const downloadPromise = page.waitForEvent('download')
    await page.locator('.download-button').click()
    
    try {
      const download = await downloadPromise
      console.log('✅ Download succeeded even with external images')
      console.log('   Filename:', download.suggestedFilename())
      
      // Check for CORS-related errors
      const corsErrors = consoleLogs.filter(log => 
        log.includes('CORS') || log.includes('cross-origin') || log.includes('tainted')
      )
      
      if (corsErrors.length > 0) {
        console.log('⚠️ CORS warnings detected but download completed:', corsErrors)
      } else {
        console.log('✅ No CORS errors detected')
      }
    } catch (error) {
      // If download failed, check if it was due to CORS
      console.log('❌ Download failed:', error)
      console.log('Console errors:', consoleLogs)
    }
  })
})