import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();

  await page.getByRole('textbox', { name: 'Nombre de usuario' }).press('ControlOrMeta+z');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('A');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('A');
  await page.getByRole('textbox', { name: 'Contraseña' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.getByRole('row', { name: '5/4/2025 PRE_AUTORIZACION 28' }).getByRole('button').click();
  await page.getByRole('combobox').nth(4).selectOption('RECLAMO_EN_ORIGEN');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator('tbody')).toContainText('PENDIENTE_RECLAMO');
});