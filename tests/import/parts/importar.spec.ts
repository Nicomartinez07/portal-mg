import { test, expect } from '@playwright/test';
import * as path from 'path'; // 👈 1. Import the 'path' module

test('test', async ({ page }) => {
  // 2. Construct the absolute path to your file
  //    '__dirname' is the directory of the current test file.
  //    We navigate up to the project root (if test is in a subdirectory) 
  //    and then down to public/archivos. Adjust this path based on 
  //    where your test file is relative to './public/archivos/FORMATOREPUESTOS.xlsx'.
  const filePath = path.join(__dirname, '..', '..', '..', 'public', 'archivos', 'FORMATOREPUESTOS.xlsx');
  
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Repuestos' }).click();
  await page.getByRole('button', { name: 'Importar Stock' }).click();
  
  // 3. Use the absolute path in setInputFiles()
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath); 
  await page.getByLabel('Empresa a Importar:Seleccione').selectOption('1');
  await page.getByRole('button', { name: 'Importar', exact: true }).click();
  await expect(page.locator('body')).toContainText('Importación Exitosa');
});