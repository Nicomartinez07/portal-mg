import { test, expect } from '@playwright/test';

test('Filtrar por vin inexistente y visibilizar que no hay datos de ese auto', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).click();
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).fill('a');
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).press('Enter');
  await expect(page.locator('body')).toContainText('No se encontró el vehículo');
});



