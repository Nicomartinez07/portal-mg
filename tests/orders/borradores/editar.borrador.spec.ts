import { test, expect } from '@playwright/test';

test('Debe mostrar alerta de éxito al actualizar borrador', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('link', { name: 'Borradores' }).click();
  await page.getByTestId('detalles-8').click();
  await page.getByRole('textbox', { name: 'Ingrese kilometraje' }).fill('22001');

  // 1. Configura el "listener" del diálogo ANTES de hacer click.
  //    'page.once' se asegura de que solo se ejecute la primera vez.
  page.once('dialog', async (dialog) => {
    
    // 2. Imprime el mensaje (opcional, bueno para debug)
    console.log(`Mensaje del diálogo: ${dialog.message()}`);
    
    // 3. ¡Esta es la aserción!
    //    Verifica que el texto del diálogo sea exactamente el esperado.
    expect(dialog.message()).toBe('✅ Borrador actualizado correctamente');
    
    // 4. Acepta el diálogo (como hacer clic en "OK")
    //    Si no haces esto, el test se quedará colgado esperando.
    await dialog.accept();
  });

  // 5. Esta es la acción que dispara el diálogo
  await page.getByRole('button', { name: 'Actualizar Borrador' }).click();
});