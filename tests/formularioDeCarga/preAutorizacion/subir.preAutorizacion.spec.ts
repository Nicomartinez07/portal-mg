import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Pre-autorización' }).click();
  await page.getByRole('textbox', { name: 'Ingrese VIN del vehículo' }).fill('VIN00004');
  await page.locator('form').getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('textbox', { name: 'Ingrese el numero interno de' }).fill('234567');
  await page.getByRole('textbox', { name: 'Ingrese nombre completo del' }).fill('Cliente');
  await page.getByRole('textbox', { name: 'Ingrese kilometraje' }).click();
  await page.getByRole('textbox', { name: 'Ingrese kilometraje' }).fill('13000');
  await page.getByRole('textbox', { name: 'Ingrese el diagnóstico' }).click();
  await page.getByRole('textbox', { name: 'Ingrese el diagnóstico' }).fill('aaaaaaa');
  await page.getByRole('textbox', { name: 'Ingrese observaciones' }).click();
  await page.getByRole('textbox', { name: 'Ingrese observaciones' }).fill('aaaaaaa');
  await page.getByRole('button', { name: 'Enviar Pre-Autorización' }).click();
  await expect(page.locator('tbody')).toContainText('VIN00004');
  await expect(page.locator('tbody')).toContainText('PRE_AUTORIZACION');
});