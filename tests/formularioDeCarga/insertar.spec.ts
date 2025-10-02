import { test, expect } from '@playwright/test';

test('Insertar Auto y verificarlo mediante VIN', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Cargar Auto' }).click();
  await page.locator('input[name="vin"]').fill('00000000000000000');
  await page.locator('input[name="brand"]').fill('AAAAA');
  await page.locator('input[name="model"]').fill('AAAAA');
  await page.locator('input[name="licensePlate"]').fill('AAAAA');
  await page.getByRole('spinbutton').fill('2000');
  await page.locator('input[name="engineNumber"]').fill('0000');
  await page.locator('input[name="type"]').fill('AAAAA');
  await page.locator('input[name="certificateNumber"]').fill('0000');
  await page.locator('input[name="saleDate"]').fill('0001-01-01');
  await page.getByRole('button', { name: 'Guardar' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).fill('00000000000000000');
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).press('Enter');
  await expect(page.locator('body')).toContainText('VIN:00000000000000000Modelo:AAAAA AAAAANro. Motor:0000Año:2000');
});