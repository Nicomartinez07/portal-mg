// tests/global.teardown.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function globalTeardown() {
  try {
    console.log('\n🧹 Limpiando base de datos (global teardown)...');

    // El orden importa por las relaciones (de dependientes a padres)
    await prisma.userRole.deleteMany();
    await prisma.order.deleteMany();
    await prisma.warranty.deleteMany();
    await prisma.part.deleteMany();
    await prisma.partContact.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.company.deleteMany();
    await prisma.customer.deleteMany();

    console.log('✅ Base de datos de pruebas limpiada con éxito');
  } catch (error) {
    console.error('❌ Error durante la limpieza global:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}