import { test, expect } from '@playwright/test';
import * as path from 'path'; // Para construir la ruta de guardado

test('Descargar Archivo ejemplo', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Repuestos' }).click();
  await page.getByRole('button', { name: 'Importar Stock' }).click();
  
  const downloadLink = page.getByRole('link', { name: 'Descargar archivo de ejemplo' });
  
  await expect(downloadLink).toBeVisible();

  // 1. Esperar el evento 'download' ANTES de hacer click
  const downloadPromise = page.waitForEvent('download');
  
  // 2. Click para iniciar la descarga
  await downloadLink.click();
  
  // 3. Obtener el objeto de descarga
  const download = await downloadPromise;

  // --- Verificaciones ---

  // 4. Verificar el nombre del archivo (opcional pero recomendado)
  const suggestedFilename = download.suggestedFilename();
  // Puedes verificar el nombre exacto o parte del nombre
  await expect(suggestedFilename).toContain('EjemploRepuestos'); 

  // 5. Guardar el archivo en una ubicación temporal (Obligatorio para verificar que se descargó)
  // Define dónde quieres guardar el archivo. Por ejemplo, en una carpeta temporal 'test-downloads'
  const downloadsPath = path.join(__dirname, 'downloads', suggestedFilename);
  await download.saveAs(downloadsPath);

  // 6. Verificar que el archivo realmente existe y no está vacío (la mejor prueba)
  // Puedes usar una librería de Node.js como 'fs' para esto
  // Por simplicidad, Playwright ya garantiza que el archivo se guardó, pero si quieres
  // ser más explícito, podrías hacer:
  
  const fs = require('fs');
  expect(fs.existsSync(downloadsPath)).toBe(true);
  expect(fs.statSync(downloadsPath).size).toBeGreaterThan(0); // Verifica que el archivo no está vacío

  console.log(`Archivo descargado y guardado en: ${downloadsPath}`);
});