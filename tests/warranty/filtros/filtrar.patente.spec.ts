import { test, expect } from '@playwright/test';

test('Filtrar por Patente', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.locator('div').filter({ hasText: /^Patente$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^Patente$/ }).getByRole('textbox').press('CapsLock');
  await page.locator('div').filter({ hasText: /^Patente$/ }).getByRole('textbox').fill('ABC9XYZ');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'ABC9XYZ' })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('ABC9XYZ');
});