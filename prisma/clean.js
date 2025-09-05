// prisma/clean.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Borrando todos los registros de la base de datos...");

  // El orden importa por las relaciones (de dependientes a padres)
  // Tablas dependientes
  await prisma.userRole.deleteMany();
  await prisma.orderTaskPart.deleteMany(); // Añadir esta línea
  await prisma.orderTask.deleteMany(); // Añadir esta línea
  await prisma.orderPhoto.deleteMany(); // Añadir esta línea
  await prisma.orderStatusHistory.deleteMany(); // Añadir esta línea
  await prisma.order.deleteMany();
  await prisma.warranty.deleteMany();
  await prisma.part.deleteMany();
  await prisma.partContact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.company.deleteMany();
  await prisma.customer.deleteMany();

  console.log("✅ Todos los registros han sido eliminados.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
