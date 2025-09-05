import { test, expect } from '@playwright/test';

test('Filtrar por Patente', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.locator('div').filter({ hasText: /^Patente$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^Patente$/ }).getByRole('textbox').press('CapsLock');
  await page.locator('div').filter({ hasText: /^Patente$/ }).getByRole('textbox').fill('ABC9XYZ');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'ABC9XYZ' })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('ABC9XYZ');
});