const { execSync } = require('child_process');
const { chromium } = require('@playwright/test');
require('dotenv').config(); // Carga tu .env para las variables

const authFile = 'tests/auth.json';
const TEST_DB_URL = "mysql://root:root@localhost:3306/portalmg_test_db";

async function globalSetup(config) {
  console.log('✨ [SETUP] Configurando base de datos de testing (MySQL)...');

  // 1. Asigna la URL de la DB de test a la variable de entorno
  //    para que los comandos de Prisma la usen.
  process.env.DATABASE_URL = TEST_DB_URL;

  // 2. Crea/Resetea la base de datos de test
  try {
    // 'migrate reset' borra la DB, la vuelve a crear,
    // aplica migraciones y corre el seed (si está en package.json)
    console.log('Aplicando migraciones a la DB de test...');
    execSync('npx prisma migrate reset --force', {
      env: { ...process.env }, // Pasa la DATABASE_URL de test
      stdio: 'inherit',
    });

    // Si tu seed no está en package.json como "prisma.seed",
    // ejecútalo manualmente (como en tu archivo original).
    // Asumiré que tu seed ahora es 'prisma/seed.js' (no 'test-seed.js')
    console.log('Ejecutando seed en la DB de test...');
    execSync('node prisma/seed.js', {
      env: { ...process.env }, // Sigue usando la DATABASE_URL de test
      stdio: 'inherit',
    });

    console.log('✅ [SETUP] Base de datos de testing (MySQL) lista.');
  } catch (error) {
    console.error('❌ Error en Global Setup (DB):', error.message);
    process.exit(1);
  }

  // 3. Login y storageState
  console.log('🤖 [SETUP] Realizando login para generar auth state...');

  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(`${baseURL}/`);
    await page.context().storageState({ path: authFile });
  } catch (error) {
    console.error('❌ Error en Global Setup (Login):', error.message);
    await browser.close();
    process.exit(1);
  }

  await browser.close();
  console.log('--- [SETUP] Global setup completo ---');
}

module.exports = globalSetup;