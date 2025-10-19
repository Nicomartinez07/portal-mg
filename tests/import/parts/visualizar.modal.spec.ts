import { test, expect } from '@playwright/test';

test('Visualizar modal de insert Repuestos', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Repuestos' }).click();
  await page.getByRole('button', { name: 'Importar Stock' }).click();
  await expect(page.getByRole('paragraph')).toContainText('Seleccione un archivo para importar el stock de repuestos (.xlsx).Descargar archivo de ejemplo');
  await expect(page.getByRole('button', { name: 'Choose File' })).toBeVisible();
});