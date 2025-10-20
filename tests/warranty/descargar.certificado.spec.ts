import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';    

// 3. Definir una carpeta para las descargas del test
const downloadsDir = path.join(__dirname, 'test-downloads');

test('Debe descargar un certificado y verificar que no esté vacío', async ({ page }) => {
  // 4. Asegurarse de que la carpeta de descargas exista
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.locator('div').filter({ hasText: /^VIN$/ }).getByRole('textbox').fill('VIN00020');
  await page.getByRole('button', { name: 'Buscar' }).click();
  // 1. Encuentra la fila que contiene el texto "VIN00020"
  const row = page.getByRole('row').filter({ hasText: 'VIN00020' });

  // 2. Dentro de esa fila específica, busca el botón "Detalles" y haz clic
  await row.getByRole('button', { name: 'Detalles' }).click();

  
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Certificado' }).click();
  const download = await downloadPromise;

  // --- Verificaciones ---

  // 5. Definir la ruta completa donde se guardará el archivo
  const suggestedFilename = download.suggestedFilename();
  const downloadsPath = path.join(downloadsDir, suggestedFilename);

  // 6. Guardar el archivo en el disco
  await download.saveAs(downloadsPath);

  // 7. Verificar que el archivo realmente existe
  expect(fs.existsSync(downloadsPath)).toBe(true);

  // 8. ¡Tu verificación! Comprobar que el tamaño es mayor a 0 bytes.
  expect(fs.statSync(downloadsPath).size).toBeGreaterThan(0);

  console.log(`Archivo verificado: ${suggestedFilename} (Tamaño: ${fs.statSync(downloadsPath).size} bytes)`);
});