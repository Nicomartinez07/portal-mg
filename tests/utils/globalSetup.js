// globalSetup.js
require('dotenv').config({ path: './prisma/.env.test' }); 
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const authFile = 'tests/auth.json'; 


async function globalSetup(config) {

  console.log('✨ [SETUP] Configurando base de datos de testing (SQLite)...');

  const DB_PATH = path.resolve(process.cwd(), './prisma/test.db');
  
  if (fs.existsSync(DB_PATH)) {
    console.log(`Borrando archivo DB residual: ${DB_PATH}`);
    fs.unlinkSync(DB_PATH);
  }

  // --- 1. LÓGICA DE BASE DE DATOS (Tu código) ---
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    execSync('npx ts-node prisma/test-seed.js', { stdio: 'inherit' }); 
    console.log('✅ [SETUP] Base de datos de testing lista.');
  } catch (error) {
    console.error('❌ Error en Global Setup (DB):', error.message);
    process.exit(1);
  }

  // --- 2. NUEVO: LÓGICA DE LOGIN ---
  console.log('🤖 [SETUP] Realizando login para generar auth state...');
  
  // Obtenemos la baseURL desde la configuración de Playwright
  const { baseURL } = config.projects[0].use; 
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Ir a la página de login
    await page.goto(`${baseURL}/login`); 

    // === ¡IMPORTANTE! ===
    // Usa las credenciales del usuario que creaste en 'prisma/test-seed.js'
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'Admin123!');
    
    // Clic en el botón de login
    await page.click('button[type="submit"]');

    await page.waitForURL(`${baseURL}/`);
    
    // Guardar el estado de la sesión
    await page.context().storageState({ path: authFile });
  } catch (error) {
    console.error('❌ Error en Global Setup (Login):', error.message);
    await browser.close();
    process.exit(1); // Detiene todo si el login falla
  }
  
  await browser.close();
  console.log('--- [SETUP] Global setup completo ---');
  // --- FIN NUEVO ---
}

module.exports = globalSetup;