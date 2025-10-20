import { test, expect } from '@playwright/test';

test('test filtrar orden por tipo', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Ordenes' }).click();
   await page.locator('input[name="fromDate"]').fill('2025-01-01');
  await page.locator('select[name="type"]').selectOption('PRE_AUTORIZACION');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'PRE_AUTORIZACION' })).toBeVisible();
});

