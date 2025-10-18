import { test, expect } from '@playwright/test';

test('filtrar por vin2 y ver los resultados del correspondiente auto', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).fill('VIN00011');
  await page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' }).press('Enter');
  await expect(page.getByText('VIN00011')).toBeVisible();
  await expect(page.getByText('Brand11 Model11')).toBeVisible();

});