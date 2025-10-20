import { test, expect } from '@playwright/test';

test('ir a repuestos y visualizar tabs', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Repuestos' }).click();
  await expect(page.getByRole('tab', { name: 'Datos de Talleres' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Listado de Repuestos' })).toBeVisible();
});