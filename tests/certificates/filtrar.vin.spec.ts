import { test, expect } from '@playwright/test';

test('Filtrar certificado por vin', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Certificados' }).click();
  await page.locator('input[name="vin"]').click();
  await page.locator('input[name="vin"]').press('CapsLock');
  await page.locator('input[name="vin"]').fill('VIN00002');
  await page.locator('div').filter({ hasText: /^BloqueadoNo bloqueado$/ }).getByRole('button').click();
  await expect(page.getByRole('cell', { name: 'CERT0002' })).toBeVisible();
});