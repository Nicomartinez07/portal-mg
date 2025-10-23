import { test, expect } from '@playwright/test';
import fs from 'fs'; // 1. Importar el File System de Node.js

test('Exportar ordenes y verificar que es un archivo con algun contenido', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Ordenes' }).click();
  await page.locator('input[name="fromDate"]').fill('2024-10-01');
  await page.getByRole('button', { name: 'Buscar' }).click();
  
  // Iniciar la espera ANTES del click
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar' }).click();
  
  // Esperar a que la descarga termine
  const download = await downloadPromise;
  
  // 2. Obtener la ruta del archivo descargado
  const path = await download.path();

  // 3. Verificar que el path existe (que algo se descargó)
  expect(path).not.toBeNull();

  // 4. Usar 'fs' para obtener las estadísticas del archivo
  const stats = fs.statSync(path);

  // 5. Verificar que el tamaño (size) en bytes es mayor a 0
  expect(stats.size).toBeGreaterThan(0);
});