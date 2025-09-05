import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('input[name="orderNumber"]').fill('99999');
  await expect(page.getByRole('cell', { name: 'VIN', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '99999' }).first()).toBeVisible();
});