import { test, expect } from '@playwright/test';

test('Loguearte a la pagina para posteriormente visualizar los 2 botones de salir y ver que es funcional', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await expect(page.getByRole('button', { name: 'Salir' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Admin' })).toBeVisible();
  await page.getByRole('button', { name: 'Admin' }).click();
  await expect(page.getByRole('menuitem', { name: 'Salir' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Salir' }).click();
  await expect(page.getByRole('heading', { name: 'Inicia Sesión con tu cuenta' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});