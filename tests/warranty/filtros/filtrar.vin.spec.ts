import { test, expect } from '@playwright/test';

test('Filtrar por VIN y visualizar el VIN correspondiente', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.locator('div').filter({ hasText: /^VIN$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^VIN$/ }).getByRole('textbox').fill('VIN00018');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'VIN00018' })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('VIN00018');
});