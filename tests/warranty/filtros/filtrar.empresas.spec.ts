import { test, expect } from '@playwright/test';

test('Poder seleccionar empresas y poder filtrar por ellas', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.getByRole('combobox').selectOption({ label: 'Central Workshop' });
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('tbody')).toContainText('Central Workshop');
  await expect(page.getByRole('cell', { name: 'Central Workshop' }).nth(1)).toBeVisible();
});