import { test, expect } from '@playwright/test';

test('Borrar un usuario de la empresa CITYDRIVE / GRUPO TAGLE', async ({ page }) => {
  await page.goto('http://localhost:3000/'); 
  await page.getByRole('link', { name: 'Empresas' }).click();
  await page.getByRole('row', { name: 'CITYDRIVE / GRUPO TAGLE' }).getByRole('button').first().click();
  await expect(page.getByRole('cell', { name: 'Francisco Vernocchi' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Renzo Agustin Rolando' })).toBeVisible();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('row', { name: 'Renzo Agustin Rolando' }).getByRole('button').nth(1).click();
  await expect(page.getByRole('cell', { name: 'Francisco Vernocchi' })).toBeVisible();

});