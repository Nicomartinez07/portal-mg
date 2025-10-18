import { test, expect } from '@playwright/test';

test('Verificar que no se puede cargar algo vacio', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Activar Garantia' }).click();
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.locator('form')).toContainText('Campo requerido.');
});