import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs'; // Necesitas importar 'fs' (File System)

// Definimos la ruta donde se guardarán las descargas del test
const downloadsDir = path.join(__dirname, 'test-downloads');

test('Debe descargar un archivo al hacer click en Descargar', async ({ page }) => {
  // 1. Asegurarse de que el directorio de descargas exista
  // Si no existe, lo creamos
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  // 2. Navegar a la página principal
  await page.goto('http://localhost:3000/');

  await page.getByRole('link', { name: 'Repuestos' }).click();
  // 3. Ir a la pestaña "Listado de Repuestos" (basado en la imagen)
  // Asumo que el botón "Repuestos" te lleva a "Listado de Repuestos"
  await page.getByRole('tab', { name: 'Datos de Talleres' }).click();

  // --- El patrón de descarga empieza aquí ---

  // 4. Iniciar la espera del evento 'download' *ANTES* de hacer click.
  const downloadPromise = page.waitForEvent('download');

  // 5. Hacer click en el botón "Descargar"
  // Para ser más precisos, buscamos el botón dentro de la fila "Eximar MG"
  const row = page.getByRole('row', { name: /Eximar MG/i });
  await row.getByRole('link', { name: 'Descargar' }).click();

  // 6. Esperar a que la promesa de descarga se resuelva
  const download = await downloadPromise;

  // --- Verificación de la descarga ---

  // 7. (Opcional pero recomendado) Verificar el nombre del archivo
  const suggestedFilename = download.suggestedFilename();
  console.log(`Archivo descargado: ${suggestedFilename}`);

  // 8. Guardar el archivo en el directorio de descargas del test
  const downloadsPath = path.join(downloadsDir, suggestedFilename);
  await download.saveAs(downloadsPath);

  // 9. Verificar que el archivo existe en el disco y no está vacío
  expect(fs.existsSync(downloadsPath)).toBe(true); // El archivo existe
  expect(fs.statSync(downloadsPath).size).toBeGreaterThan(0); // El archivo tiene contenido

  console.log(`Archivo guardado exitosamente en: ${downloadsPath}`);
});