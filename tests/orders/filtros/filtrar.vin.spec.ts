import { test, expect } from '@playwright/test';

test('Filtrar oredenes por VIN', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('input[name="fromDate"]').fill('2025-01-01');
  await page.locator('input[name="vin"]').fill('VIN00004');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('cell', { name: 'VIN00004' }).first().click();
  await page.getByRole('cell', { name: 'VIN00004' }).first().click();
  await page.getByRole('cell', { name: 'PRE_AUTORIZACION' }).first().click();
  await expect(page.getByRole('cell', { name: 'PRE_AUTORIZACION' }).first()).toBeVisible();
  await expect(page.getByRole('cell', { name: 'VIN00004' }).first()).toBeVisible();

  });



