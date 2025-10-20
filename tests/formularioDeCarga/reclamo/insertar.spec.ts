import { test, expect } from '@playwright/test';

test('Insertar Reclamo', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.getByRole('button', { name: 'Reclamo' }).click();
  await page.getByRole('textbox', { name: 'Ingrese ID de pre-autorización' }).fill('11');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.locator('div').filter({ hasText: /^Pre-autorizaciónBuscar$/ }).getByRole('button').click();
  await page.getByRole('textbox', { name: 'Ingrese el numero interno de' }).fill('14235');
  await page.getByRole('textbox', { name: 'Ingrese observaciones' }).fill('Observacion');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Enviar Reclamo' }).click();
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('input[name="vin"]').fill('VIN00004');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'RECLAMO', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'VIN00004' }).first()).toBeVisible();
});