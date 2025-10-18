import { test, expect } from '@playwright/test';

test('Filtrar por estado RECHAZADO Y VISUALIZAR', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('select[name="status"]').selectOption('RECHAZADO');
  await expect(page.getByRole('cell', { name: 'RECHAZADO' }).first()).toBeVisible();
});