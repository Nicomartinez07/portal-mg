import { test, expect } from '@playwright/test';

// Es bueno darle un nombre descriptivo al test
test('Debe convertir borrador a orden y mostrar alerta de éxito', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Borradores' }).click();
  await page.getByTestId('detalles-5').click();

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe('✅ Borrador convertido a orden correctamente');

    await dialog.accept();
  });
  // -------------------------------

  // 5. Esta acción dispara el diálogo que acabamos de configurar
  await page.getByRole('button', { name: 'Enviar Pre-Autorización' }).click();
});