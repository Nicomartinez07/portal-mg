import { test, expect } from '@playwright/test';

test('visualizar el buscador de vin desde distintas paginas de la aplicacion', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('textbox', { name: 'Contraseña' }).press('Enter');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Gestión de Garantías' })).toBeVisible();
  await page.getByRole('link', { name: 'Empresas' }).click();
  await expect(page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Configuración de Empresas' })).toBeVisible();
  await page.getByRole('link', { name: 'Certificados' }).click();
  await expect(page.getByRole('textbox', { name: 'Buscar vehiculo por VIN' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Consulta de Certificados' })).toBeVisible();
});