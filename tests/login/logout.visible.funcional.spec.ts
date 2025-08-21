import { test, expect } from '@playwright/test';

test('Loguearte a la pagina para posteriormente visualizar los 2 botones de salir y ver que es funcional', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Usuario' })).toBeVisible();
  await page.getByRole('button', { name: 'Usuario' }).click();
  await expect(page.getByRole('menuitem', { name: 'Salir' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Salir' }).click();
  await expect(page.getByRole('heading', { name: 'Inicia Sesión con tu cuenta' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});