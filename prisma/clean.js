// prisma/clean.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Borrando todos los registros de la base de datos...");

  // El orden importa por las relaciones (de dependientes a padres)
  // Tablas dependientes
  await prisma.usuarioRol.deleteMany(); 
  await prisma.orden.deleteMany();    
  await prisma.garantia.deleteMany();   
  await prisma.repuesto.deleteMany();   
  // Tablas intermedias 
  await prisma.contactoRepuesto.deleteMany();
  // Tablas “padre”
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany();
  await prisma.vehiculo.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.cliente.deleteMany();

  console.log("✅ Todos los registros han sido eliminados.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
