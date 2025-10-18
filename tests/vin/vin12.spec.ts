import { test, expect } from '@playwright/test';

test('filtrar por vin 01 y visibilizar los datos del auto correspondiente', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).fill('VIN00012');
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).press('Enter');
  await expect(page.getByText('Brand12 Model12')).toBeVisible();
  await expect(page.getByText('VIN00012')).toBeVisible();

});
