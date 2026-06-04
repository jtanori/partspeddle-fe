import { test, expect } from '@playwright/test';

test.describe('Marketplace Search E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search for parts by keyword and display results', async ({ page }) => {
    // Mock search API response
    await page.route('/api/search/parts?q=alternator*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hits: [{ objectID: 'p1', title: 'Ford F150 Alternator', price: 1500, condition: 'used' }],
          totalHits: 1,
          page: 0,
          totalPages: 1
        }),
      });
    });

    await page.fill('input[placeholder*="Search"]', 'alternator');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=Ford F150 Alternator')).toBeVisible();
    await expect(page.locator('text=1500')).toBeVisible();
  });

  test('should filter by condition and display filtered results', async ({ page }) => {
    // Mock filtered API response
    await page.route('/api/search/parts?q=&condition=used*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hits: [{ objectID: 'p2', title: 'Used Alternator', price: 500, condition: 'used' }],
          totalHits: 1,
          page: 0,
          totalPages: 1
        }),
      });
    });

    await page.goto('/search?condition=used');
    await expect(page.locator('text=Used Alternator')).toBeVisible();
  });
});
