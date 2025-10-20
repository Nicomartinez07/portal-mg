import { test, expect } from '@playwright/test';

test('Tocar Info Tecnica y verificar que me manda a otra pestaña', async ({ page }) => {
  await page.goto('http://localhost:3000');

  const page1Promise = page.waitForEvent('popup');
  
  // 2. Hacer click en el link
  await page.getByRole('link', { name: 'Info Técnica' }).click();
  
  // 3. Esperar a que la nueva pestaña se abra
  const newPage = await page1Promise;

  // --- Verificaciones ---

  // 4. (MUY IMPORTANTE) Esperar a que la nueva pestaña termine de cargar
  await newPage.waitForLoadState();

  // 5. Verificar que la URL de la nueva pestaña es la correcta
  // (¡Ajusta esta URL por la que esperas!)
  await expect(newPage).toHaveURL('https://drive.google.com/drive/folders/1unjLakNYCpBBbOorUzeuMp0N5jAs1qSt');

  // 6. (Opcional) También puedes verificar el título de la nueva pestaña
  // await expect(newPage).toHaveTitle('Título de la Página de Info Técnica');

  // 7. (Opcional) Cierras la pestaña nueva para limpiar el estado
  await newPage.close();
});