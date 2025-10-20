import { test, expect } from '@playwright/test';

test('Cambiar estado interno de una ORDEN', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('input[name="fromDate"]').fill('2024-01-01');
  await page.locator('input[name="VIN"]').fill('VIN00004');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByTestId('detalles-4').click();
  await page.getByRole('combobox').nth(4).selectOption('NO_RECLAMABLE');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('cell', { name: '4', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'NO_RECLAMABLE' })).toBeVisible();
});

