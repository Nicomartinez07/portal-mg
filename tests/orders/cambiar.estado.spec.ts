import { test, expect } from '@playwright/test';

test('Rechazar una orden que estaba en estado PENDIENTE A RECHAZADO', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await expect(page.getByRole('cell', { name: 'VIN00001' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'PENDIENTE', exact: true }).nth(2)).toBeVisible();
  await page.getByTestId('detalles-1').click();
  await page.getByRole('button', { name: 'Rechazar' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Rechazar' }).nth(1).click();
  await expect(page.getByRole('cell', { name: 'VIN00001' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'RECHAZADO' })).toBeVisible();
});