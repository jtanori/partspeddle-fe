import { test, expect } from '@playwright/test';

test.describe('Cataloging Wizard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Inject auth session
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({ access_token: 'mock_token' }));
    });
    await page.goto('/dashboard/snap');
  });

  test('should successfully ingest and scan a part', async ({ page }) => {
    // Mock the API route
    await page.route('/api/gemini/identify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          system: 'Powertrain',
          category: 'Charging',
          part_type: 'Alternator',
          brand: 'Motorcraft',
          model: 'F-150',
          oem_part_number: 'F4TZ-10346-A',
          confidence_scores: { part_type_accuracy: 0.98 }
        }),
      });
    });

    // Upload file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'part.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-content'),
    });

    // Validate UI state changes
    await expect(page.locator('text=part.jpg')).toBeVisible();
    
    // Execute Scan
    await page.locator('text=Execute Scan').click();
    await expect(page.locator('text=Executing Scan...')).toBeVisible();

    // Validate Autocomplete
    await expect(page.locator('input[placeholder="Part Title"]')).toHaveValue('Alternator');
    await expect(page.locator('input[placeholder="System"]')).toHaveValue('Powertrain');
  });
});
