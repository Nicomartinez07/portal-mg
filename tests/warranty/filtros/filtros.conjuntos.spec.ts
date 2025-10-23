import { test, expect } from '@playwright/test';

test('Filtrar por nombre y por VIN al mismo tiempo', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.locator('div').filter({ hasText: /^VIN$/ }).getByRole('textbox').fill('VIN00010');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'VIN00010' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Anna Martinez' })).toBeVisible();
});