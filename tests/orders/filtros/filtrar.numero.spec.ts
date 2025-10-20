import { test, expect } from '@playwright/test';

test('Test filtrar por Numero de orden', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('input[name="orderNumber"]').fill('100000');
   await page.locator('input[name="fromDate"]').fill('2025-03-01');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('tbody')).toContainText('100000');
  await expect(page.locator('tbody')).toContainText('PRE_AUTORIZACION');
});