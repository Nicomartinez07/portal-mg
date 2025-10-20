import { test, expect } from '@playwright/test';

test('Filtrar por estado AUTORIZADA Y VISUALIZAR', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('input[name="vin"]').fill('VIN00004');
  await page.locator('select[name="status"]').selectOption('RECHAZADO');
  await page.locator('input[name="fromDate"]').fill('2025-03-01');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'RECHAZADO' }).first()).toBeVisible();
});