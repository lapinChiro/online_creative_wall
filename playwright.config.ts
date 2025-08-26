import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: process.env.CI !== undefined && process.env.CI !== '' ? 60 * 1000 : 30 * 1000, // CI: 60秒、ローカル: 30秒
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: process.env.CI !== undefined && process.env.CI !== '',
  /* Retry on CI only */
  retries: process.env.CI !== undefined && process.env.CI !== '' ? 1 : 0, // リトライ回数を減らす
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI !== undefined && process.env.CI !== '' ? 2 : undefined, // CI環境でも並列実行
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.CI !== undefined && process.env.CI !== '' ? 'http://localhost:4173' : 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Always run tests in headless mode by default */
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: process.env.CI !== undefined && process.env.CI !== '' 
    ? [
        // CI環境では主要ブラウザのみテスト
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
          },
        },
        {
          name: 'firefox',
          use: {
            ...devices['Desktop Firefox'],
          },
        },
      ]
    : [
        // ローカルでは全ブラウザをテスト
        {
          name: 'chromium',
          use: {
            ...devices['Desktop Chrome'],
          },
        },
        {
          name: 'firefox',
          use: {
            ...devices['Desktop Firefox'],
          },
        },
        {
          name: 'webkit',
          use: {
            ...devices['Desktop Safari'],
          },
        },
        {
          name: 'Microsoft Edge',
          use: {
            ...devices['Desktop Edge'],
          },
        },
      ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  webServer: {
    /**
     * Use the dev server by default for faster feedback loop.
     * Use the preview server on CI for more realistic testing.
     * Playwright will re-use the local server if there is already a dev-server running.
     */
    command: process.env.CI !== undefined && process.env.CI !== '' ? 'npm run preview' : 'npm run dev',
    port: process.env.CI !== undefined && process.env.CI !== '' ? 4173 : 5173,
    reuseExistingServer: !(process.env.CI !== undefined && process.env.CI !== ''),
    timeout: 120 * 1000,
  },
})
