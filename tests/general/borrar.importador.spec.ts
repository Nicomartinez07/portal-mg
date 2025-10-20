import { test, expect } from '@playwright/test';

test('Debe confirmar la eliminación y verificar la alerta de éxito', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'General' }).click();

  // 1. Preparamos el listener para el PRIMER diálogo (Confirmación)
  page.once('dialog', async (dialog1) => {
    console.log(`Diálogo 1 (Confirmación): ${dialog1.message()}`);
    
    // 2. Verificamos su texto
    expect(dialog1.message()).toBe('¿Estás seguro que quieres eliminar este usuario?');

    // 3. ANIDAMOS el listener para el SEGUNDO diálogo (Éxito)
    //    Este listener solo se activa DESPUÉS de que el primero apareció.
    page.once('dialog', async (dialog2) => {
      console.log(`Diálogo 2 (Éxito): ${dialog2.message()}`);
      
      // 5. Verificamos el texto del segundo diálogo
      expect(dialog2.message()).toBe('Usuario eliminado correctamente ✅');
      
      // 6. Aceptamos el segundo diálogo
      await dialog2.accept();
    });

    // 4. Aceptamos el PRIMER diálogo
    //    Esto dispara la lógica de borrado y el segundo diálogo
    await dialog1.accept(); 
  });

  // 7. Hacemos clic en el botón que dispara TODO el flujo
  await page.getByRole('row', { name: 'Hernan Ponce hponce@eximar.' })
    .getByRole('button')
    .nth(1) // Clic en el segundo botón (índice 1)
    .click();

  // 8. (Recomendado) Verificamos que la fila realmente desapareció
  await expect(page.getByRole('row', { name: 'Hernan Ponce hponce@eximar.' }))
    .not.toBeVisible();
});