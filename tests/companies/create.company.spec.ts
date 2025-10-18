import { test, expect } from '@playwright/test';

test('test Crear una empresa', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Empresas' }).click();
  await page.getByRole('button', { name: '+ Nueva Empresa' }).click();
  await page.locator('input[name="name"]').fill('a');
  await page.getByRole('button', { name: 'Aceptar' }).click();
  await expect(page.locator('tbody')).toContainText('a');
});