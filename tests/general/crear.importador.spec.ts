import { test, expect } from '@playwright/test';

test('Crear importador', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'General' }).click();
  await page.getByRole('button', { name: 'Nuevo Usuario' }).click();
  await page.locator('input[name="email"]').fill('importador@gmail.com');
  await page.getByRole('combobox').selectOption('1');
  await page.locator('input[name="password"]').fill('importador');
  await page.locator('input[name="confirmPassword"]').fill('importador');
  await page.locator('input[name="name"]').fill('importador');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => { });
  });
  await page.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByRole('cell', { name: 'importador', exact: true })).toBeVisible();
  await expect(page.locator('tbody')).toContainText('importador');
});