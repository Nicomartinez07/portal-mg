import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Empresas' }).click();
  await page.getByRole('button', { name: '+ Nueva Empresa' }).click();
  await page.locator('input[name="name"]').fill('a');
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await expect(page.locator('tbody')).toContainText('a');
});