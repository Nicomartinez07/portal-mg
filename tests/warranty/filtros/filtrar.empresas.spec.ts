import { test, expect } from '@playwright/test';

test('Poder seleccionar empresas y poder filtrar por ellas', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await expect(page.getByRole('combobox')).toBeVisible();
  await page.getByRole('combobox').selectOption('78');
  await expect(page.getByRole('combobox')).toBeVisible();
  await page.getByRole('combobox').selectOption('80');
  await page.getByRole('combobox').selectOption('77');
  await page.getByRole('combobox').selectOption('76');
  await page.getByRole('combobox').selectOption('79');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'Western Dealership' }).first()).toBeVisible();
  await page.getByRole('combobox').selectOption('78');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'Central Workshop' }).first()).toBeVisible();
  await page.getByRole('combobox').selectOption('76');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('cell', { name: 'Southern Importer' }).first()).toBeVisible();
});