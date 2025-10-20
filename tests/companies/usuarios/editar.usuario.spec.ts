import { test, expect } from '@playwright/test';
test('test Editar un usuario', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Empresas' }).click();
  await page.getByRole('row', { name: 'Eximar MG Usuarios Detalles' }).getByRole('button').first().click();
  await page.getByRole('row', { name: 'Carlos Martinez cmartinez@eximar.com.ar' }).getByRole('button').first().click();
  await page.locator('input[name="username"]').click();
  await page.locator('input[name="username"]').fill('Carlos Martinezz');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Actualizar' }).click();
  //await page.getByRole('button', { name: '×' }).click();
  //await page.getByRole('row', { name: 'Eximar MG Usuarios Detalles' }).getByRole('button').first().click();
  await expect(page.locator('body')).toContainText('Carlos Martinezz');

});