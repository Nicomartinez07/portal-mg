import { test, expect } from '@playwright/test';

test('Loguearme con el usuario administrador', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await expect(page.getByRole('heading', { name: 'Bienvenido a la pagina de MG' })).toBeVisible();
});