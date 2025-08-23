import { test, expect } from '@playwright/test';
//PREGUNTARLE A BLANCO PORQ ME TARDA TANTO EN ENTRAR AL BOTON 
test('Visualizar Moddle el cual me permita ver informacion del cliente y del vehiculo', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).click();
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('Admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('Admin123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.locator('tbody')).toContainText('VIN00020');
  await expect(page.locator('tbody')).toContainText('Anna Martinez');
  await page.getByRole('row', { name: '20/3/2025 VIN00020 Model20' }).getByRole('button').click();
  await expect(page.getByRole('heading', { name: 'Activación de Garantía' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cliente' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vehículo' })).toBeVisible();
});