import { test, expect } from '@playwright/test';

test('test filtrar orden por tipo', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('select[name="type"]').selectOption('PRE_AUTORIZACION');
  await expect(page.getByRole('cell', { name: 'PRE_AUTORIZACION' }).first()).toBeVisible();
});