import { test, expect } from '@playwright/test';

test('Test filtrar por Numero de orden', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Borradores' }).click();
  await page.locator('input[name="orderNumber"]').fill('99999');
  await expect(page.locator('tbody')).toContainText('99999');
  await expect(page.locator('tbody')).toContainText('PRE_AUTORIZACION');
});