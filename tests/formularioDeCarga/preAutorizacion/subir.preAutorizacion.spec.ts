import { test, expect } from '@playwright/test';

test('Ingresar un pre-autorización utilizando buscador de VIN00002', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Pre-autorización' }).click();
  await page.getByRole('textbox', { name: 'Ingrese VIN del vehículo' }).fill('VIN00002');
  await page.locator('form').getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('textbox', { name: 'Ingrese el numero interno de' }).fill('34567');
  await page.getByRole('textbox', { name: 'Ingrese nombre completo del' }).fill('Cliente');
  await page.getByRole('textbox', { name: 'Ingrese el diagnóstico' }).fill('Diagnostico');
  await page.getByRole('textbox', { name: 'Ingrese observaciones' }).fill('Diagnostico');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Enviar Pre-Autorización' }).click();
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await expect(page.getByRole('cell', { name: 'PRE_AUTORIZACION' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'VIN00002' }).first()).toBeVisible();
});

