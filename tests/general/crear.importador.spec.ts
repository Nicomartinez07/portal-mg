import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'General' }).click();
  await page.getByRole('button', { name: 'Nuevo Usuario' }).click();
  await page.locator('input[name="username"]').fill('Importador');
  await page.getByRole('combobox').selectOption('1');
  await page.locator('input[name="email"]').fill('importador@gmail.com');
  await page.locator('input[name="confirmPassword"]').fill('eximar');
  await page.locator('input[name="password"]').fill('eximar');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByRole('cell', { name: 'Importador', exact: true })).toBeVisible();
});