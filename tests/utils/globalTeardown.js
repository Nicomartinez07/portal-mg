// globalTeardown.js

require('dotenv').config({ path: './prisma/.env.test' }); 
const fs = require('fs'); // Necesitas el módulo 'fs'
const path = require('path');

async function globalTeardown() {
  console.log('🗑️ [TEARDOWN] Limpiando base de datos de testing (SQLite)...');

  const DB_PATH = path.resolve(process.cwd(), './prisma/test.db');
  
  // 1. Eliminar el archivo de la base de datos
  try {
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
      console.log(`✅ [TEARDOWN] Archivo de base de datos '${DB_PATH}' eliminado.`);
    } else {
      console.log('Archivo de base de datos no encontrado. Limpieza completada.');
    }
  } catch (error) {
    console.error('❌ Error al eliminar el archivo de base de datos:', error.message);
  }
}

module.exports = globalTeardown;