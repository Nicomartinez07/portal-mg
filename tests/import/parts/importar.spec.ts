import { test, expect } from '@playwright/test';
import * as path from 'path';

test('test', async ({ page }) => {
  const filePath = path.join(__dirname, '..', '..', '..', 'public', 'archivos', 'FORMATOREPUESTOS.xlsx');
  
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Repuestos' }).click();
  await page.getByRole('button', { name: 'Importar Stock' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath); 
  await page.getByLabel('Empresa a Importar:Seleccione').selectOption('1');
  await page.getByRole('button', { name: 'Importar', exact: true }).click();
  await expect(page.locator('body')).toContainText('Importación Exitosa');
});