import { test, expect } from "@playwright/test";

test("Ir a página indevida y verificar redireccióne porque no tengo permisos", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "Admin" }).click();
  await page.getByRole("menuitem", { name: "Salir" }).click();
  await page.getByRole("textbox", { name: "Nombre de usuario" }).click();
  await page
    .getByRole("textbox", { name: "Nombre de usuario" })
    .fill("Fabio Summa");
  await page.getByRole("textbox", { name: "Contraseña" }).click();
  await page.getByRole("textbox", { name: "Contraseña" }).fill("fsumma");
  await page.getByRole("button", { name: "Login" }).click();

  // Intentar acceder a la URL restringida
  await page.goto("http://localhost:3000/ordenes/borradores");

  // Verificar que la URL cambia a 'unauthorized'
  await expect(page).toHaveURL(
    "http://localhost:3000/login?redirectBack=%2Fordenes%2Fborradores"
  );
});
