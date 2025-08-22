import { test, expect } from '@playwright/test';

// Creative Wall アプリケーションのルートURL訪問テスト
test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  // アプリケーションコンテナが表示されることを確認
  await expect(page.locator('.app-container')).toBeVisible();
  // 黒板コンポーネントが表示されることを確認
  await expect(page.locator('.blackboard')).toBeVisible();
})
