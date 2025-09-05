import { test, expect } from '@playwright/test';

test('filtrar por vin 01 y visibilizar los datos del auto correspondiente', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).click();
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).fill('VIN00012');
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).press('Enter');
  await expect(page.getByText('Brand12 Model12')).toBeVisible();
  await expect(page.getByText('VIN00012')).toBeVisible();

});
