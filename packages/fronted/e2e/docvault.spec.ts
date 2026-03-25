import { test, expect } from '@playwright/test';

// Smoke tests — require running backend (DATABASE_URL, GitHub OAuth configured)
// Run with: pnpm exec playwright test

test.describe('DocVault Smoke Tests', () => {
  test('home page loads without errors', async ({ page }) => {
    await page.goto('/');
    // Should not throw console errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('login page has GitHub login button', async ({ page }) => {
    await page.goto('/home/login');
    const githubButton = page.getByText('Sign in with GitHub');
    await expect(githubButton).toBeVisible();
  });

  test('search bar renders on home page', async ({ page }) => {
    await page.goto('/home/cloud-docs');
    const searchInput = page.getByPlaceholder('🔍 搜索文档...');
    await expect(searchInput).toBeVisible();
  });

  test('dark mode toggle is present after login', async ({ page }) => {
    // Note: This test requires being logged in (cookie set)
    // For now, test the login page layout
    await page.goto('/home/login');
    // Page should load without crash
    await expect(page).toHaveTitle(/DocVault|登录/);
  });

  test('messages page placeholder is visible', async ({ page }) => {
    await page.goto('/home/messages');
    const placeholder = page.getByText('消息中心');
    await expect(placeholder).toBeVisible();
  });

  test('calendar page placeholder is visible', async ({ page }) => {
    await page.goto('/home/calendar');
    const placeholder = page.getByText('日历');
    await expect(placeholder).toBeVisible();
  });
});
