import { test, expect } from '@playwright/test';

test('Filtrar oredenes por VIN', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('input[name="vin"]').press('CapsLock');
  await page.locator('input[name="vin"]').fill('VIN00004');
  await expect(page.getByRole('cell', { name: 'VIN00004' }).first()).toBeVisible();
  });