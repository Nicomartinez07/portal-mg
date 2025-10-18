import { test, expect } from "@playwright/test";

test("Visualizar Errores", async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Cargar Auto' }).click();
  await page.getByRole('combobox').selectOption('1');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.locator('form')).toContainText('El VIN debe tener exactamente 17 caracteres.');
});
