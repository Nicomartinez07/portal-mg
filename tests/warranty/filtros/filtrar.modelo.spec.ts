import { test, expect } from '@playwright/test';

test('Filtrar por modelo y visualizar', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.locator('div').filter({ hasText: /^Modelo$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^Modelo$/ }).getByRole('textbox').fill('Model12');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'Model12' })).toBeVisible();
});