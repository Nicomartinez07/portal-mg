import { test, expect } from '@playwright/test';

test('Filtrar por nombre y por VIN al mismo tiempo', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.locator('div').filter({ hasText: /^VIN$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^VIN$/ }).getByRole('textbox').fill('VIN00020');
  await page.locator('div').filter({ hasText: /^Nombre Cliente$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^Nombre Cliente$/ }).getByRole('textbox').fill('Anna');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'VIN00020' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Anna Martinez' })).toBeVisible();
});