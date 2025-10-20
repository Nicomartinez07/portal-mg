import { test, expect } from '@playwright/test';

test('Filtrar por empresa ', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Repuestos' }).click();
  await page.getByRole('tab', { name: 'Listado de Repuestos' }).click();
  await page.getByRole('combobox').selectOption('1');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('td:nth-child(2)').first()).toBeVisible();
  await expect(page.locator('tbody')).toContainText('Eximar MG');

});