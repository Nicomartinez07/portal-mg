import { test, expect } from '@playwright/test';
import * as path from 'path'; // Necesitas importar 'path'
import * as fs from 'fs';     // Necesitas importar 'fs' (File System)

// Definimos dónde guardar el archivo descargado
const downloadsDir = path.join(__dirname, 'test-downloads');

test('Tocar tarifario y verificar que se me descarga un archivo llamado tarifario.pdf', async ({ page }) => {
  // 1. Asegurarse de que el directorio de descargas exista
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  await page.goto('http://localhost:3000');
  
  // 2. Iniciar la espera del evento 'download' ANTES del click
  const downloadPromise = page.waitForEvent('download');
  
  // 3. Hacer click en el link
  await page.getByRole('link', { name: 'Tarifario' }).click();
  
  // 4. Esperar a que la descarga se complete
  const download = await downloadPromise;

  // --- Verificaciones ---

  // 5. Verificar que el nombre del archivo es el esperado
  const suggestedFilename = download.suggestedFilename();
  await expect(suggestedFilename).toBe('tarifario.xlsx');

  // 6. Guardar el archivo para verificar que existe y tiene contenido
  const downloadsPath = path.join(downloadsDir, suggestedFilename);
  await download.saveAs(downloadsPath);

  // 7. Verificar que el archivo existe en el disc
  expect(fs.existsSync(downloadsPath)).toBe(true);
});