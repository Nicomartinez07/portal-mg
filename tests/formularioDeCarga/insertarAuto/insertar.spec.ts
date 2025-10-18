import { test, expect } from '@playwright/test';

test('Insertar Auto y verificarlo', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Cargar Auto' }).click();
  await page.locator('input[name="vin"]').fill('00000000000000000');
  await page.locator('input[name="brand"]').press('CapsLock');
  await page.locator('input[name="brand"]').fill('AAAAA');
  await page.locator('input[name="model"]').fill('AAAAA');
  await page.locator('input[name="licensePlate"]').fill('AAAAA');
  await page.getByRole('spinbutton').fill('2025');
  await page.locator('input[name="engineNumber"]').fill('2025');
  await page.locator('input[name="type"]').fill('AAAAA');
  await page.locator('input[name="certificateNumber"]').fill('2025');
  await page.locator('input[name="saleDate"]').fill('2025-01-01');
  await page.locator('input[name="importDate"]').fill('2025-01-02');
  await page.getByRole('combobox').selectOption('1');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).fill('00000000000000000');
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).press('Enter');
  await expect(page.locator('body')).toContainText('VIN:00000000000000000Modelo:AAAAA AAAAANro. Motor:2025Año:2025');
});
