import { test, expect } from '@playwright/test';

test('Testear por nombre de cliente', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.locator('div').filter({ hasText: /^Nombre Cliente$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^Nombre Cliente$/ }).getByRole('textbox').fill('Anna');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('tbody')).toContainText('Anna Martinez');
  await expect(page.getByRole('cell', { name: 'ABC20XYZ' })).toBeVisible();
  await expect(page.locator('tr:nth-child(2) > td:nth-child(5)')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'ABC17XYZ' })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('Anna Martinez');
});