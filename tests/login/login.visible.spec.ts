import { test, expect } from '@playwright/test';

test('Vizualizar el login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByRole('heading', { name: 'Inicia Sesión con tu cuenta' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await expect(page.getByText('Si no tienes cuenta o')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mostrar u ocultar contraseña' })).toBeVisible();
});