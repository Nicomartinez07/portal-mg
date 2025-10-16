import { test, expect } from '@playwright/test';

test('Insertar Reclamo', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Reclamo' }).click();
  await page.getByRole('textbox', { name: 'Ingrese ID de pre-autorización' }).fill('4');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.locator('div').filter({ hasText: /^Pre-autorizaciónBuscar$/ }).getByRole('button').click();
  await page.getByRole('textbox', { name: 'Ingrese el numero interno de' }).click();
  await page.getByRole('textbox', { name: 'Ingrese el numero interno de' }).fill('12345');
  await page.getByRole('textbox', { name: 'Ingrese observaciones' }).click();
  await page.getByRole('textbox', { name: 'Ingrese observaciones' }).fill('AAAA');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Enviar Reclamo' }).click();
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await expect(page.locator('tbody')).toContainText('RECLAMO');
  await expect(page.locator('tbody')).toContainText('VIN00004');
});