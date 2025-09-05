import { test, expect } from '@playwright/test';

test('filtrar por vin2 y ver los resultados del correspondiente auto', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin123!');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).click();
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).fill('VIN00011');
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).press('Enter');
  await expect(page.getByText('VIN00011')).toBeVisible();
  await expect(page.getByText('Brand11 Model11')).toBeVisible();

});