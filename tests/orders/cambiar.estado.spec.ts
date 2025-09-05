import { test, expect } from '@playwright/test';

test('test cambiar estado interno de una orden', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.getByTestId('detalles-100').click();
  await page.getByRole('combobox').nth(4).selectOption('RECHAZADO_EN_ORIGEN');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.locator('tbody')).toContainText('PENDIENTE_RECLAMO');

});
