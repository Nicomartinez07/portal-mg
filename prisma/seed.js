const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Limpiando base de datos...");

  // Borrar tablas en orden correcto por FK
  await prisma.usuarioRol.deleteMany();
  await prisma.orden.deleteMany();
  await prisma.garantia.deleteMany();
  await prisma.repuesto.deleteMany();
  await prisma.contactoRepuesto.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.rol.deleteMany();
  await prisma.vehiculo.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.cliente.deleteMany();

  console.log("✅ Base de datos limpia");

  // --------------------------------------
  // Roles
  // --------------------------------------
  console.log("🛠 Insertando roles...");
  const rolesData = ["ADMINISTRADOR", "IMPORTADORA", "CONCESIONARIO", "TALLER"];
  const roles = {};
  for (const nombre of rolesData) {
    const rol = await prisma.rol.create({ data: { nombre } });
    roles[nombre] = rol;
  }
  console.log("✅ Roles insertados");

  // --------------------------------------
  // Empresas
  // --------------------------------------
  console.log("🏢 Insertando empresas...");
  const empresasData = [
    { nombre: "Importadora Sur", direccion: "Av. Siempre Viva 123", provincia: "Buenos Aires", localidad: "La Plata", telefono1: "123456789", telefono2: "987654321", email: "contacto@importadora.com", tipoEmpresa: "Importadora" },
    { nombre: "Concesionario Norte", direccion: "Calle Falsa 456", provincia: "Córdoba", localidad: "Córdoba", telefono1: "1122334455", telefono2: "5544332211", email: "ventas@concesionariocn.com", tipoEmpresa: "Concesionario" },
    { nombre: "Taller Central", direccion: "Av. Central 789", provincia: "Buenos Aires", localidad: "La Plata", telefono1: "2233445566", telefono2: "6655443322", email: "contacto@tallercentral.com", tipoEmpresa: "Taller" },
    { nombre: "Concesionario Oeste", direccion: "Calle Oeste 101", provincia: "Mendoza", localidad: "Mendoza", telefono1: "3344556677", telefono2: "7766554433", email: "ventas@concesionariooeste.com", tipoEmpresa: "Concesionario" },
    { nombre: "Importadora Este", direccion: "Av. Este 202", provincia: "Santa Fe", localidad: "Rosario", telefono1: "4455667788", telefono2: "8877665544", email: "contacto@importadoraeste.com", tipoEmpresa: "Importadora" }
  ];
  const empresas = [];
  for (const e of empresasData) {
    const empresa = await prisma.empresa.create({ data: e });
    empresas.push(empresa);
  }
  console.log("✅ Empresas insertadas");

  // --------------------------------------
  // Usuarios
  // --------------------------------------
  console.log("👤 Insertando usuarios...");
  const usuariosData = [
    { nombre: "Administrador", email: "admin@empresa.com", notificaciones: true, contraseña: "Admin", empresaId: empresas[0].id },
    { nombre: "Juan Pérez", email: "juan@rio.com", notificaciones: true, contraseña: "usuario", empresaId: empresas[1].id },
    { nombre: "María López", email: "maria@lopez.com", notificaciones: false, contraseña: "usuario", empresaId: empresas[2].id },
    { nombre: "Carlos Ruiz", email: "carlos@norte.com", notificaciones: false, contraseña: "usuario", empresaId: empresas[3].id },
    { nombre: "Laura Fernández", email: "laura@progreso.com", notificaciones: true, contraseña: "usuario", empresaId: empresas[4].id }
  ];

  const usuarios = [];
  for (const u of usuariosData) {
    const usuario = await prisma.usuario.create({ data: u });
    usuarios.push(usuario);
  }
  console.log("✅ Usuarios insertados");

  // --------------------------------------
  // Asignar roles a usuarios
  // --------------------------------------
  console.log("🔗 Asignando roles a usuarios...");
  const asignaciones = [
    { usuario: usuarios[0], rol: roles["ADMINISTRADOR"] },
    { usuario: usuarios[1], rol: roles["CONCESIONARIO"] },
    { usuario: usuarios[2], rol: roles["TALLER"] },
    { usuario: usuarios[3], rol: roles["CONCESIONARIO"] },
    { usuario: usuarios[4], rol: roles["TALLER"] }
  ];

  for (const a of asignaciones) {
    await prisma.usuarioRol.create({
      data: {
        usuarioId: a.usuario.id,
        rolId: a.rol.id
      }
    });
  }
  console.log("✅ Roles asignados a los usuarios");

  // --------------------------------------
  // Clientes
  // --------------------------------------
  console.log("🧑‍🤝‍🧑 Insertando clientes...");
  const clientesData = [
    { nombre: "Pedro", apellido: "Gómez", email: "pedro@gmail.com", telefono: "111222333", direccion: "Calle A 123", provincia: "Buenos Aires", localidad: "La Plata" },
    { nombre: "Ana", apellido: "Martínez", email: "ana@gmail.com", telefono: "444555666", direccion: "Calle B 456", provincia: "Córdoba", localidad: "Córdoba" },
    { nombre: "Luis", apellido: "Rodríguez", email: "luis@gmail.com", telefono: "777888999", direccion: "Calle C 789", provincia: "Mendoza", localidad: "Mendoza" }
  ];
  const clientes = [];
  for (const c of clientesData) {
    const cliente = await prisma.cliente.create({ data: c });
    clientes.push(cliente);
  }
  console.log("✅ Clientes insertados");

  // --------------------------------------
  // Vehículos
  // --------------------------------------
  console.log("🚗 Insertando vehículos...");
  const vehiculosData = [];
  for (let i = 1; i <= 10; i++) {
    vehiculosData.push({
      fecha: new Date(),
      vin: `VIN000${i}`,
      marca: `Marca${i}`,
      modelo: `Modelo${i}`,
      nroMotor: `Motor${i}`,
      tipo: "Sedán",
      año: 2020 + i % 3,
      nroCertificado: `CERT00${i}`,
      venta: new Date(),
      fechaImportacion: new Date(),
      patente: `ABC${i}XYZ`
    });
  }
  const vehiculos = [];
  for (const v of vehiculosData) {
    const vehiculo = await prisma.vehiculo.create({ data: v });
    vehiculos.push(vehiculo);
  }
  console.log("✅ Vehículos insertados");

  // --------------------------------------
  // Órdenes
  // --------------------------------------
  console.log("📄 Insertando órdenes...");
  const ordenesData = [
    {
      fechaCreacion: new Date(),
      clienteId: clientes[0].id,
      vehiculoVin: vehiculos[0].vin,
      empresaId: empresas[1].id,
      usuarioId: usuarios[1].id,
      estado: "En proceso",
      estadoInterno: "Pendiente",
      kilometrajeReal: 1000,
      diagnostico: "Chequeo general",
      observacionesAdicionales: "Ninguna",
      tareas: "Cambio de aceite",
      cantHoras: 2,
      repuestos: "Filtro de aceite",
      DescripRepuesto: "Filtro modelo X"
    },
    {
      fechaCreacion: new Date(),
      clienteId: clientes[1].id,
      vehiculoVin: vehiculos[1].vin,
      empresaId: empresas[3].id,
      usuarioId: usuarios[3].id,
      estado: "Completada",
      estadoInterno: "Listo",
      kilometrajeReal: 5000,
      diagnostico: "Revisión frenos",
      observacionesAdicionales: "Todo OK",
      tareas: "Revisión y cambio pastillas",
      cantHoras: 3,
      repuestos: "Pastillas de freno",
      DescripRepuesto: "Pastillas marca Y"
    }
  ];
  for (const o of ordenesData) {
    await prisma.orden.create({ data: o });
  }
  console.log("✅ Órdenes insertadas");

  // --------------------------------------
  // Garantías
  // --------------------------------------
  console.log("🛡 Insertando garantías...");
  const garantiasData = [
    { fechaActivacion: new Date(), vehiculoVin: vehiculos[0].vin, empresaId: empresas[1].id, usuarioId: usuarios[1].id },
    { fechaActivacion: new Date(), vehiculoVin: vehiculos[1].vin, empresaId: empresas[3].id, usuarioId: usuarios[3].id }
  ];
  for (const g of garantiasData) {
    await prisma.garantia.create({ data: g });
  }
  console.log("✅ Garantías insertadas");

  console.log("🎉 Seed completado!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
