import { test, expect } from '@playwright/test';

test('Filtrar por codigo ', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Repuestos' }).click();
  await page.getByRole('tab', { name: 'Listado de Repuestos' }).click();
  await page.getByRole('textbox', { name: 'Buscar por código' }).fill('BAT002');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'BAT002' })).toBeVisible();
});