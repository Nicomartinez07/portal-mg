import { test, expect } from '@playwright/test';
import fs from 'fs'; // 1. Importar el File System

test('Exportar garantías y verificar que es un archivo con algun contenido', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Garantías' }).click();
  await page.getByRole('button', { name: 'Buscar' }).click();
  
  // Iniciar la espera
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar' }).click();
  
  // Esperar la descarga
  const download = await downloadPromise;

  // --- Verificación ---
  
  // 2. Obtener la ruta
  const path = await download.path();
  
  // 3. Verificar que existe
  expect(path).not.toBeNull();

  // 4. Obtener estadísticas
  const stats = fs.statSync(path);
  
  // 5. Verificar tamaño
  expect(stats.size).toBeGreaterThan(0);
  
});