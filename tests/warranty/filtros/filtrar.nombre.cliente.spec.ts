import { test, expect } from '@playwright/test';

test('Testear por nombre de cliente', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.locator('div').filter({ hasText: /^Nombre Cliente$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^Nombre Cliente$/ }).getByRole('textbox').fill('Anna');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('tbody')).toContainText('Anna Martinez');
  await expect(page.getByRole('cell', { name: 'ABC10XYZ' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'ABC16XYZ' })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('Anna Martinez');
});