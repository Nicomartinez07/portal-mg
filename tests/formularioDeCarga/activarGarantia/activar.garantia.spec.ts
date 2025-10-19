import { test, expect } from '@playwright/test';

test('Insertar Auto y activarle la garantia', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Cargar Auto' }).click();
  await page.locator('input[name="vin"]').fill('00000000000000002');
  await page.locator('input[name="brand"]').press('CapsLock');
  await page.locator('input[name="brand"]').fill('AAAAAA');
  await page.locator('input[name="model"]').fill('AAAAAA');
  await page.locator('input[name="licensePlate"]').fill('AAAAAA');
  await page.getByRole('spinbutton').fill('2025');
  await page.locator('input[name="engineNumber"]').fill('2025');
  await page.locator('input[name="type"]').fill('AAAAAA');
  await page.locator('input[name="certificateNumber"]').fill('202020');
  await page.locator('input[name="saleDate"]').fill('2025-01-01');
  await page.locator('input[name="importDate"]').fill('2025-01-02');
  await page.getByRole('combobox').selectOption('1');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.getByRole('button', { name: 'Activar Garantia' }).click();
  await page.locator('input[name="vin"]').fill('00000000000000002');
  await page.getByTestId('search-vehicle-button').click();
  await page.locator('input[name="user"]').fill('Fabio Summa');
  await page.locator('input[name="clientName"]').fill('cliente');
  await page.locator('input[name="clientSurname"]').fill('cliente');
  await page.locator('input[name="clientEmail"]').fill('c@gmail.com');
  await page.locator('input[name="clientPhone"]').fill('12345678');
  await page.locator('input[name="clientDirection"]').fill('cliente');
  await page.locator('select[name="clientProvince"]').selectOption('Buenos Aires');
  await page.locator('select[name="clientLocality"]').selectOption('No Encontrada');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: '00000000000000002' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Fabio Summa' }).first()).toBeVisible();
});
