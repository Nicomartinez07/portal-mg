import { test, expect } from '@playwright/test';
//preguntar porque no llega el tiempo de ejecucion
test('Filtrar por año 2023', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.locator('div').filter({ hasText: /^Desde$/ }).getByRole('textbox').fill('2023-01-01');
  await page.locator('div').filter({ hasText: /^Hasta$/ }).getByRole('textbox').fill('2023-09-30');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('tbody')).toContainText('8/8/2023');
  await expect(page.locator('tbody')).toContainText('7/7/2023');
});