import { test, expect } from '@playwright/test';

//preguntale a blanco si no es porque acabo de borrar el registro del usuario "Mati PEDAZO DE GIL"
test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Empresas' }).click();
  await page.getByRole('combobox').selectOption('Central Workshop');
  await page.getByRole('button', { name: 'Usuarios' }).click();
  await expect(page.getByRole('cell', { name: 'Mary Johnson' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Mati PEDAZO DE GIL' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Mati PEDAZO DE GIL');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Eliminar' }).nth(2).click();
  await expect(page.locator('body')).toContainText('Mary Johnson');
});