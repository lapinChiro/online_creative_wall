/* eslint-disable no-console */
import { test, expect } from '@playwright/test'
import { promises as fs } from 'fs'
import path from 'path'

test.describe('Visual Quality Comparison', () => {
  test('should produce download with similar quality to screenshot', async ({ page }) => {
    // Create output directory for comparison
    const outputDir = path.join(process.cwd(), 'test-output')
    await fs.mkdir(outputDir, { recursive: true })
    
    // Go to the application
    await page.goto('http://localhost:5174/')
    
    // Wait for content to load
    await page.waitForSelector('.blackboard', { timeout: 10000 })
    await page.waitForTimeout(3000) // Let animations run
    
    // Pause the board
    await page.locator('#pause-button').click()
    await page.waitForTimeout(500) // Let pause animation complete
    
    // Take a screenshot of the blackboard
    const blackboard = page.locator('.blackboard')
    const screenshotPath = path.join(outputDir, 'screenshot.png')
    await blackboard.screenshot({ path: screenshotPath })
    console.log('📸 Screenshot saved:', screenshotPath)
    
    // Download the image
    const downloadPromise = page.waitForEvent('download')
    await page.locator('.download-button').click()
    const download = await downloadPromise
    
    // Save the downloaded file
    const downloadPath = path.join(outputDir, 'download.png')
    await download.saveAs(downloadPath)
    console.log('💾 Download saved:', downloadPath)
    
    // Compare file sizes
    const screenshotStats = await fs.stat(screenshotPath)
    const downloadStats = await fs.stat(downloadPath)
    
    console.log('📊 File size comparison:')
    console.log(`   Screenshot: ${(screenshotStats.size / 1024).toFixed(2)} KB`)
    console.log(`   Download:   ${(downloadStats.size / 1024).toFixed(2)} KB`)
    
    // The download should be larger (2x resolution)
    expect(downloadStats.size).toBeGreaterThan(screenshotStats.size * 1.5)
    
    console.log('✅ Visual comparison files saved to:', outputDir)
    console.log('   Please manually compare:')
    console.log(`   - ${screenshotPath} (browser screenshot)`)
    console.log(`   - ${downloadPath} (downloaded PNG)`)
    console.log('   The downloaded PNG should be clear without fog or blur')
  })
})