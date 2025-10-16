import { test, expect } from '@playwright/test';

test('Insertar Servicio', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Servicio' }).click();
  await page.getByRole('button', { name: 'Servicio' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Ingrese VIN del vehículo' }).click();
  await page.getByRole('textbox', { name: 'Ingrese VIN del vehículo' }).fill('VIN00004');
  await page.getByText('VIN', { exact: true }).click();
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByText('Or interna').click();
  await page.getByRole('textbox', { name: 'Ingrese el numero interno de' }).click();
  await page.getByRole('textbox', { name: 'Ingrese el numero interno de' }).fill('12345678');
  await page.getByText('FechaOr').click();
  await page.getByRole('combobox').selectOption('48000');
  await page.getByRole('textbox', { name: 'Ingrese kilometraje' }).click();
  await page.getByRole('textbox', { name: 'Ingrese kilometraje' }).fill('47000');
  await page.getByRole('textbox', { name: 'Ingrese observaciones' }).click();
  await page.getByRole('textbox', { name: 'Ingrese kilometraje' }).fill('47000A');
  await page.getByRole('textbox', { name: 'Ingrese observaciones' }).fill('AAAAAA');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Enviar Pre-Autorización' }).click();
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await expect(page.locator('tbody')).toContainText('SERVICIO');
  await expect(page.locator('tbody')).toContainText('VIN00004');
});