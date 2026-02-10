import { test, expect } from '@playwright/test';

test.describe('VetReg – every page', () => {
  test('Landing / loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\//);
    await expect(page.getByRole('link', { name: /log in/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible({ timeout: 10000 });
  });

  test('Signup route shows login', async ({ page }) => {
    await page.goto('/signup');
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible({ timeout: 10000 });
  });

  test('Protected dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected dashboard/clients redirects to login', async ({ page }) => {
    await page.goto('/dashboard/clients');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected dashboard/animals redirects to login', async ({ page }) => {
    await page.goto('/dashboard/animals');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected dashboard/treatments redirects to login', async ({ page }) => {
    await page.goto('/dashboard/treatments');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected dashboard/schedule redirects to login', async ({ page }) => {
    await page.goto('/dashboard/schedule');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected dashboard/revenue redirects to login', async ({ page }) => {
    await page.goto('/dashboard/revenue');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected dashboard/payments redirects to login', async ({ page }) => {
    await page.goto('/dashboard/payments');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected organizations redirects to login', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected dashboard/settings redirects to login', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected dashboard/reports redirects to login', async ({ page }) => {
    await page.goto('/dashboard/reports');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected more redirects to login', async ({ page }) => {
    await page.goto('/more');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Protected notifications redirects to login', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).toHaveURL(/\/login/);
  });

  test('NotFound (404) for unknown route', async ({ page }) => {
    await page.goto('/no-such-page-404');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/page not found|oops/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /return to home/i })).toBeVisible();
  });

  test('Auth callback route loads (stays on callback or redirects to login)', async ({ page }) => {
    await page.goto('/auth/callback');
    await expect(page).toHaveURL(/\/(auth\/callback|login)/);
  });
});
