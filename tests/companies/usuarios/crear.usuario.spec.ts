import { test, expect } from '@playwright/test';

test('test crear usuario', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Empresas' }).click();
  await page.getByRole('combobox').selectOption('Central Workshop');
  await page.getByRole('button', { name: 'Usuarios' }).click();
  await page.getByRole('button', { name: '+ Nuevo Usuario' }).click();
  await page.locator('input[name="username"]').fill('a');
  await page.locator('input[name="email"]').fill('a@gmail.com');
  await page.getByText('Concesionario').click();
  await page.getByText('Taller', { exact: true }).click();
  await page.locator('input[name="password"]').fill('a');
  await page.locator('input[name="confirmPassword"]').fill('a');  
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByRole('cell', { name: 'a', exact: true })).toBeVisible();
});