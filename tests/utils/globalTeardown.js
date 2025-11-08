const { PrismaClient } = require('@prisma/client');
const TEST_DB_URL = "mysql://root:root@localhost:3306/portalmg_test_db";
// --------------------

async function globalTeardown() {
  console.log('🧹 [TEARDOWN] Limpiando base de datos de testing...');
  try {
    // Creamos un cliente de Prisma apuntando a la DB de test
    const prisma = new PrismaClient({
      datasources: { db: { url: TEST_DB_URL } },
    });

    await prisma.$executeRawUnsafe('DROP DATABASE IF EXISTS `portalmg_test_db`;');
    await prisma.$disconnect();
    console.log('✅ [TEARDOWN] Base de datos de testing eliminada.');
  } catch (error) {
    console.error('❌ Error en Global Teardown (DB):', error.message);
    process.exit(1);
  }
}

module.exports = globalTeardown;