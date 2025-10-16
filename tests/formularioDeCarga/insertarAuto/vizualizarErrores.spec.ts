import { test, expect } from "@playwright/test";

test("Visualizar Errores", async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Cargar Auto' }).click();
  await page.getByRole('combobox').selectOption('184');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.locator('form')).toContainText('El VIN debe tener exactamente 17 caracteres.');
});
