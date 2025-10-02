import { test, expect } from "@playwright/test";

test("Visualizar Errores", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.getByRole("textbox", { name: "Nombre de usuario" }).fill("Admin");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("Admin123!");
  await page.getByRole("button", { name: "Login" }).click();
  await page.getByRole("button", { name: "Cargar Auto" }).click();
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.locator("form")).toContainText(
    "El VIN debe tener exactamente 17 caracteres."
  );
  await expect(page.locator("form")).toContainText("La marca es obligatoria.");
  await expect(page.locator("form")).toContainText("El modelo es obligatorio.");
  await expect(page.locator("form")).toContainText(
    "La patente es obligatoria."
  );
});
