import { test, expect } from '@playwright/test';

test('Visualizar filtros', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await expect(page.getByText('Desde')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Desde$/ }).getByRole('textbox')).toBeVisible();
  await expect(page.getByText('Hasta')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Hasta$/ }).getByRole('textbox')).toBeVisible();
  await expect(page.locator('label').filter({ hasText: 'VIN' })).toBeVisible();
  await expect(page.locator('label').filter({ hasText: 'Modelo' })).toBeVisible();
  await expect(page.locator('label').filter({ hasText: 'Patente' })).toBeVisible();
  await expect(page.getByText('Nombre Cliente')).toBeVisible();
  await expect(page.locator('label').filter({ hasText: 'Empresa' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
});