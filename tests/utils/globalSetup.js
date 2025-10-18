// globalSetup.js
require('dotenv').config({ path: './prisma/.env.test' }); 
const { execSync } = require('child_process');
const fs = require('fs'); // Necesitas el módulo 'fs'
const path = require('path');

async function globalSetup() {
  console.log('✨ [SETUP] Configurando base de datos de testing (SQLite)...');

  const DB_PATH = path.resolve(process.cwd(), './prisma/test.db');
  
  // 1. Opcional: Eliminar el archivo DB residual para una limpieza total.
  if (fs.existsSync(DB_PATH)) {
    console.log(`Borrando archivo DB residual: ${DB_PATH}`);
    fs.unlinkSync(DB_PATH);
  }

  try {
    // 2. Aplicar migraciones. Esto CREARÁ el archivo test.db si no existe.
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // 3. Ejecutar el seed de TEST
    execSync('npx ts-node prisma/test-seed.js', { stdio: 'inherit' }); 

    console.log('✅ [SETUP] Base de datos de testing lista.');
  } catch (error) {
    console.error('❌ Error en Global Setup:', error.message);
    process.exit(1);
  }
}

module.exports = globalSetup;