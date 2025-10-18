import { test, expect } from '@playwright/test';

test('Poder seleccionar empresas y poder filtrar por ellas', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.getByRole('combobox').selectOption({ label: 'Central Workshop' });
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('tbody')).toContainText('Central Workshop');
  await expect(page.getByRole('cell', { name: 'Central Workshop' }).nth(1)).toBeVisible();
});