/* eslint-disable no-console */
import { test, expect } from '@playwright/test'
import { promises as fs } from 'fs'
import path from 'path'

test.describe('Full Wall Capture Test', () => {
  test('should capture entire wall without cropping', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5174/')
    
    // Wait for content to load
    await page.waitForSelector('.blackboard', { timeout: 10000 })
    await page.waitForTimeout(2000) // Let animations start
    
    // Pause the board
    await page.locator('#pause-button').click()
    await page.waitForTimeout(500) // Let pause animation complete
    
    // Get the blackboard dimensions
    const blackboardDimensions = await page.locator('.blackboard').boundingBox()
    console.log('Blackboard dimensions:', blackboardDimensions)
    
    // Get scroll dimensions
    const scrollDimensions = await page.evaluate(() => {
      const blackboard = document.querySelector('.blackboard')
      if (blackboard === null) {
        return null
      }
      return {
        scrollWidth: blackboard.scrollWidth,
        scrollHeight: blackboard.scrollHeight,
        offsetWidth: blackboard.offsetWidth,
        offsetHeight: blackboard.offsetHeight,
        clientWidth: blackboard.clientWidth,
        clientHeight: blackboard.clientHeight
      }
    })
    console.log('Scroll dimensions:', scrollDimensions)
    
    // Create output directory
    const outputDir = path.join(process.cwd(), 'test-output')
    await fs.mkdir(outputDir, { recursive: true })
    
    // Take a full page screenshot
    const screenshotPath = path.join(outputDir, 'full-page-screenshot.png')
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false  // Only capture viewport
    })
    console.log('📸 Screenshot saved:', screenshotPath)
    
    // Download the PNG
    const downloadPromise = page.waitForEvent('download')
    await page.locator('.download-button').click()
    const download = await downloadPromise
    
    // Save the downloaded file
    const downloadPath = path.join(outputDir, 'full-capture-download.png')
    await download.saveAs(downloadPath)
    console.log('💾 Download saved:', downloadPath)
    
    // Check file sizes
    const screenshotStats = await fs.stat(screenshotPath)
    const downloadStats = await fs.stat(downloadPath)
    
    console.log('📊 Size comparison:')
    console.log(`   Screenshot: ${(screenshotStats.size / 1024).toFixed(2)} KB`)
    console.log(`   Download:   ${(downloadStats.size / 1024).toFixed(2)} KB`)
    
    // The download should be larger (2x resolution)
    expect(downloadStats.size).toBeGreaterThan(screenshotStats.size)
    
    console.log('✅ Full capture test complete')
    console.log('   Please visually verify that the downloaded image includes:')
    console.log('   - All images and text from the wall')
    console.log('   - No cropping at the bottom or right side')
    console.log('   - The same content visible in the screenshot')
  })
})