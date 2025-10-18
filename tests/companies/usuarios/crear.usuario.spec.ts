import { test, expect } from '@playwright/test';

test('test crear usuario', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Empresas' }).click();
  await page.getByRole('row', { name: 'AutoService Premium Usuarios' }).getByRole('button').first().click();
  await page.getByRole('button', { name: '+ Nuevo Usuario' }).click();
  await page.locator('input[name="username"]').fill('aa');
  await page.locator('input[name="email"]').fill('aa@a.com');
  await page.locator('input[name="password"]').fill('aaa');
  await page.locator('input[name="confirmPassword"]').fill('aaa');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByRole('cell', { name: 'aa', exact: true })).toBeVisible();

});