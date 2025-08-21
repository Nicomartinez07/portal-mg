import { test, expect } from '@playwright/test';

test('Loguearte sin completar los campos y verificar mensaje de error', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Debes ingresar usuario y contraseña')).toBeVisible();
});