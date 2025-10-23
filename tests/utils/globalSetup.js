const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require('@playwright/test');

const authFile = 'tests/auth.json'; 

async function globalSetup(config) {
  console.log('✨ [SETUP] Configurando base de datos de testing (SQLite)...');

  const DB_PATH = path.resolve(process.cwd(), 'prisma/test.db');

  if (fs.existsSync(DB_PATH)) {
    console.log(`Borrando archivo DB residual: ${DB_PATH}`);
    fs.unlinkSync(DB_PATH);
  }

  // Crea las tablas y seed
  try {
    execSync('npx prisma db push --schema=prisma/schema.test.prisma', { stdio: 'inherit' });
    execSync('npx ts-node prisma/test-seed.js', { stdio: 'inherit' });
    console.log('✅ [SETUP] Base de datos de testing lista.');
  } catch (error) {
    console.error('❌ Error en Global Setup (DB):', error.message);
    process.exit(1);
  }

  // Login y storageState
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
