import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.PORT ? `http://127.0.0.1:${process.env.PORT}` : 'http://127.0.0.1:3001';
const E2E_MODE = process.env.E2E_MODE === 'true';

/**
 * DocVault Frontend E2E Tests
 *
 * These tests use the E2E auth bypass (/auth/github/callback?code=e2e-test-token)
 * to skip real GitHub OAuth. The backend must be running with E2E_MODE=true.
 *
 * Prerequisites:
 * - Backend running at http://localhost:3001 (or $PORT)
 * - Database migrated and accessible
 * - E2E_MODE=true env var set on backend
 * - Playwright browsers installed: pnpm exec playwright install --with-deps chromium
 */

test.describe('DocVault Frontend E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Set up E2E auth bypass via GitHub callback
    if (E2E_MODE) {
      await page.goto(`${BACKEND_URL}/auth/github/callback?code=e2e-test-token&state=e2e`);
      // The redirect lands on /home/cloud-docs — wait for that
      await page.waitForURL(/\/home\/cloud-docs/, { timeout: 10000 }).catch(() => {
        // If URL doesn't match, try going directly
      });
    }
  });

  test('home page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('login page has GitHub login button', async ({ page }) => {
    await page.goto('/home/login');
    const githubButton = page.getByText('使用 GitHub 登录');
    await expect(githubButton).toBeVisible();
  });

  test('search bar renders on cloud-docs page', async ({ page }) => {
    if (!E2E_MODE) {
      // Skip auth-dependent tests if not in E2E mode
      test.skip(true, 'E2E_MODE not enabled');
    }
    await page.goto('/home/cloud-docs');
    const searchInput = page.getByPlaceholder('🔍 搜索文档...');
    await expect(searchInput).toBeVisible();
  });

  test('messages page placeholder is visible', async ({ page }) => {
    await page.goto('/home/messages');
    const placeholder = page.getByText('消息中心');
    await expect(placeholder).toBeVisible();
  });

  test('calendar page placeholder is visible', async ({ page }) => {
    await page.goto('/home/calendar');
    const placeholder = page.getByText('日历').first();
    await expect(placeholder).toBeVisible();
  });

  test('can create a new document via UI', async ({ page }) => {
    if (!E2E_MODE) {
      test.skip(true, 'E2E_MODE not enabled');
    }
    await page.goto('/home/cloud-docs');

    // Click "New Document" or similar button
    const newDocButton = page.getByText(/新建文档|New Document/).first();
    await expect(newDocButton).toBeVisible({ timeout: 5000 });
    await newDocButton.click();

    // Verify editor is present (title input or content area)
    const editor = page.locator('[data-testid="editor"], .ProseMirror, [contenteditable]').first();
    await expect(editor).toBeVisible({ timeout: 5000 });
  });

  test('sidebar navigation links are visible', async ({ page }) => {
    if (!E2E_MODE) {
      test.skip(true, 'E2E_MODE not enabled');
    }
    await page.goto('/home/cloud-docs');

    // Sidebar should have navigation links
    const cloudDocsLink = page.getByText('云文档').or(page.getByText('Cloud Docs'));
    await expect(cloudDocsLink.first()).toBeVisible({ timeout: 5000 });
  });
});
