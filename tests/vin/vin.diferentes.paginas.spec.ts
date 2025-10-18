 import { test, expect } from '@playwright/test';

test('Verificar que el buscador de VIN es visible desde distintas paginas', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await expect(page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' })).toBeVisible();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await expect(page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' })).toBeVisible();

});