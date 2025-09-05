import { test, expect } from '@playwright/test';


//preguntale a blanco si no es porque acabo de editar el registro
test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Empresas' }).click();
  await page.getByRole('combobox').selectOption('Central Workshop');
  await page.getByRole('button', { name: 'Usuarios' }).click();
  await page.getByRole('button', { name: 'Detalles' }).nth(1).click();
  await page.locator('div').filter({ hasText: /^Editar Usuario×$/ }).getByRole('button').click();
  await expect(page.getByRole('cell', { name: 'mary@johnson.com' })).toBeVisible();
  await page.getByRole('button', { name: 'Detalles' }).nth(1).click();
  await page.locator('input[name="email"]').fill('marya@johnson.com');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Actualizar' }).click();
  await expect(page.getByRole('cell', { name: 'marya@johnson.com' })).toBeVisible();
});