const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log("🧹 Cleaning database...");

  // Delete tables in correct order due to FK constraints
  await prisma.userRole.deleteMany();
  await prisma.orderTaskPart.deleteMany(); 
  await prisma.orderTask.deleteMany(); 
  await prisma.orderPhoto.deleteMany();
  await prisma.orderStatusHistory.deleteMany(); 
  await prisma.order.deleteMany();
  await prisma.warranty.deleteMany();
  await prisma.part.deleteMany();
  await prisma.partContact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.company.deleteMany();
  await prisma.customer.deleteMany();

  console.log("✅ Database cleaned");

  // --------------------------------------
  // Roles
  // --------------------------------------
  console.log("🛠 Inserting roles...");
  const rolesData = [
    { id: 1, name: "ADMIN" },
    { id: 2, name: "IMPORTER" },
    { id: 3, name: "DEALER" },
    { id: 4, name: "WORKSHOP" }
  ];
  
  const roles = {};
  for (const roleData of rolesData) {
    const role = await prisma.role.create({ data: roleData });
    roles[roleData.name] = role;
  }
  console.log("✅ Roles inserted");

  // --------------------------------------
  // Companies
  // --------------------------------------
  console.log("🏢 Inserting companies...");
  const companiesData = [
    { id: 1, name: "Eximar MG", address: "Av. del Libertador 1513", state: "Buenos Aires", city: "Vicente Lopez", phone1: "11 12345678", companyType: "Importer", manager: "Hernan Ponce", showInParts: true },
    { id: 2, name: "Southern Importer", address: "123 Evergreen Ave", state: "Buenos Aires", city: "La Plata", phone1: "123456789", companyType: "Importer" },
    { id: 3, name: "Northern Dealership", address: "456 Fake St", state: "Córdoba", city: "Córdoba", phone1: "1122334455", companyType: "Dealer" },
    { id: 4, name: "Central Workshop", address: "789 Central Ave", state: "Buenos Aires", city: "La Plata", phone1: "2233445566", companyType: "Workshop", manager: "Roberto García", showInParts: true },
    { id: 5, name: "Western Dealership", address: "101 West St", state: "Mendoza", city: "Mendoza", phone1: "3344556677", companyType: "Dealer" },
    { id: 6, name: "Eastern Importer", address: "202 East Ave", state: "Santa Fe", city: "Rosario", phone1: "4455667788", companyType: "Importer" },
    { id: 7, name: "Taller Mecánico Rápido", address: "Av. Siempre Viva 742", state: "Buenos Aires", city: "La Plata", phone1: "2214567890", companyType: "Workshop", manager: "Carlos Mendoza" },
    { id: 8, name: "AutoService Premium", address: "Calle Falsa 123", state: "Córdoba", city: "Córdoba", phone1: "3519876543", companyType: "Workshop", manager: "María López", showInParts: true  },
    { id: 9, name: "Mecánica Express", address: "Ruta 8 Km 65", state: "Buenos Aires", city: "Mercedes", phone1: "2324455667", companyType: "Workshop", manager: "Juan Pérez", showInParts: true  },
    { id: 10, name: "Taller del Sur", address: "Av. San Martín 567", state: "Santa Fe", city: "Rosario", phone1: "3412345678", companyType: "Workshop", manager: "Ana Rodríguez", showInParts: true  },
    { id: 11, name: "Service Automotor", address: "Belgrano 890", state: "Mendoza", city: "Mendoza", phone1: "2613456789", companyType: "Workshop", manager: "Pedro González", showInParts: true  },
    { id: 12, name: "CITYDRIVE / GRUPO TAGLE", address: "Av.Circunvalacion", state: "Cordoba", city: "Cordoba", phone1: "2613456789", companyType: "Workshop", manager: "Francisco Vernocchi", showInParts: true },

  ];
  
  const companies = [];
  for (const c of companiesData) {
    const company = await prisma.company.create({ data: c });
    companies.push(company);
  }
  console.log("✅ Companies inserted");

  
  // --------------------------------------
  // Users
  // --------------------------------------
  console.log("👤 Inserting users...");
  const SALT_ROUNDS = 10;
  const usersData = [
    { id: 1, username: "Admin", email: "admin@company.com", notifications: false, password: await bcrypt.hash("Admin123!", SALT_ROUNDS), companyId: companies[1].id },
    { id: 2, username: "Alejandro Krzychowiec", email: "akrzychowiec@eximar.com.ar", notifications: false, password: await bcrypt.hash("akrzychowiec", SALT_ROUNDS), companyId: companies[0].id },
    { id: 3, username: "Carlos Martinez", email: "cmartinez@eximar.com.ar", notifications: true, password: await bcrypt.hash("cmartinez", SALT_ROUNDS), companyId: companies[0].id },
    { id: 4, username: "Fabio Summa", email: "fsumma@eximar.com.ar", notifications: true, password: await bcrypt.hash("fsumma", SALT_ROUNDS), companyId: companies[0].id },
    { id: 5, username: "Federico Paterno", email: "fpaterno@eximar.com.ar", notifications: true, password: await bcrypt.hash("fpaterno", SALT_ROUNDS), companyId: companies[0].id },
    { id: 6, username: "Gaston Santillan", email: "gsantillan@eximar.com.ar", notifications: true, password: await bcrypt.hash("gsantillan", SALT_ROUNDS), companyId: companies[0].id },
    { id: 7, username: "Hernan Ponce", email: "hponce@eximar.com.ar", notifications: false, password: await bcrypt.hash("hponce", SALT_ROUNDS), companyId: companies[0].id },
    { id: 8, username: "Maria Rodriguez", email: "mrodriguez@eximar.com.ar", notifications: false, password: await bcrypt.hash("mrodriguez", SALT_ROUNDS), companyId: companies[0].id },
    { id: 9, username: "Valentin Devries", email: "vdevries@eximar.com.ar", notifications: false, password: await bcrypt.hash("vdevries", SALT_ROUNDS), companyId: companies[0].id },
    { id: 10, username: "Zoe Baldrich", email: "zbaldrich@eximar.com.ar", notifications: false, password: await bcrypt.hash("zbaldrich", SALT_ROUNDS), companyId: companies[0].id },
    { id: 11, username: "Francisco Vernocchi", email: "francisco.vernocchi@autocity.com.ar", notifications: false, password: await bcrypt.hash("fvernocchi", SALT_ROUNDS), companyId: companies[11].id },
    { id: 12, username: "Renzo Agustin Rolando", email: "renzo.rolando@autocity.com.ar", notifications: false, password: await bcrypt.hash("rrolando", SALT_ROUNDS), companyId: companies[11].id },
    
    

  ];
  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.create({ data: u });
    users.push(user);
  }
  console.log("✅ Users inserted");

  // --------------------------------------
  // Assign roles to users
  // --------------------------------------
  console.log("🔗 Assigning roles to users...");
  await prisma.userRole.createMany({
    data: [
      { userId: 1, roleId: roles["ADMIN"].id },
      { userId: 2, roleId: roles["IMPORTER"].id },
      { userId: 3, roleId: roles["IMPORTER"].id },
      { userId: 4, roleId: roles["IMPORTER"].id },
      { userId: 5, roleId: roles["IMPORTER"].id },
      { userId: 6, roleId: roles["IMPORTER"].id },
      { userId: 7, roleId: roles["IMPORTER"].id },
      { userId: 8, roleId: roles["IMPORTER"].id },
      { userId: 9, roleId: roles["IMPORTER"].id },
      { userId: 10, roleId: roles["IMPORTER"].id },
      { userId: 11, roleId: roles["WORKSHOP"].id },
      { userId: 12, roleId: roles["WORKSHOP"].id },
    ]
  });
  console.log("✅ Roles assigned to users");

  // --------------------------------------
  // Customers
  // --------------------------------------
  console.log("🧑‍🤝‍🧑 Inserting customers...");
  const customersData = [
    { id: 1, firstName: "Peter", lastName: "Gomez", email: "peter@gmail.com", phone: "111222333", address: "123 A St", state: "Buenos Aires", city: "La Plata" },
    { id: 2, firstName: "Anna", lastName: "Martinez", email: "anna@gmail.com", phone: "444555666", address: "456 B St", state: "Córdoba", city: "Córdoba" },
    { id: 3, firstName: "Louis", lastName: "Rodriguez", email: "louis@gmail.com", phone: "777888999", address: "789 C St", state: "Mendoza", city: "Mendoza" }
  ];
  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({ data: c });
    customers.push(customer);
  }
  console.log("✅ Customers inserted");

  // --------------------------------------
  // Vehicles
  // --------------------------------------
  console.log("🚗 Inserting vehicles...");
  const vehiclesData = [];
  for (let i = 1; i <= 20; i++) {
    vehiclesData.push({
      id: i,
      date: new Date(),
      vin: `VIN${i.toString().padStart(5, "0")}`,
      brand: `Brand${i}`,
      model: `Model${i}`,
      engineNumber: `Engine${i}`,
      type: i % 2 === 0 ? "SUV" : "Sedan",
      year: 2018 + (i % 6),
      certificateNumber: `CERT${i.toString().padStart(4, "0")}`,
      saleDate: new Date(2020, (i % 12), 15),
      importDate: new Date(2019, (i % 12), 10),
      licensePlate: `ABC${i}XYZ`,
      blocked: true,
      companyId: 1,
    });
  }
  
  const vehicles = {};
  for (const vehicleData of vehiclesData) {
    const vehicle = await prisma.vehicle.create({ data: vehicleData });
    vehicles[vehicleData.id] = vehicle;
  }
  console.log("✅ Vehicles inserted");

  // --------------------------------------
  // PartContact & Parts
  // --------------------------------------
  console.log("📞 Inserting part contact...");
  const partContact = await prisma.partContact.create({
    data: {
      id: 1,
      contactName: "Proveedor Central de Repuestos",
      address: "Av. Industrial 1234",
      state: "Buenos Aires",
      city: "La Plata",
      phone1: "2211234567",
      email: "repuestos@proveedorcentral.com"
    }
  });
  console.log("✅ Part contact inserted");

  console.log("🔧 Inserting parts...");
  const partsData = [
    { id: 1, code: "FIL001", description: "Filtro de Aceite Premium", model: "FP-1000", stock: 25, salePrice: 45.99, companyId: companies[0].id, contactId: partContact.id },
    { id: 2, code: "BAT002", description: "Batería 12V 60Ah", model: "BT-6000", stock: 15, salePrice: 189.50, companyId: companies[1].id, contactId: partContact.id },
    { id: 3, code: "DIS003", description: "Juego de Discos de Freno", model: "DF-2023", stock: 8, salePrice: 320.75, companyId: companies[2].id, contactId: partContact.id },
    { id: 4, code: "BUF004", description: "Pastillas de Freno Delanteras", model: "PF-D500", stock: 30, salePrice: 87.25, companyId: companies[3].id, contactId: partContact.id },
    { id: 5, code: "ACE005", description: "Aceite Sintético 5W30", model: "OIL-S5W30", stock: 50, salePrice: 65.00, companyId: companies[4].id, contactId: partContact.id }
  ];

  const createdParts = await prisma.$transaction(
    partsData.map(p => prisma.part.create({
      data: {
        ...p,
        loadDate: new Date()
      }
    }))
  );

  console.log("✅ Parts inserted");

  // --------------------------------------
  // ORDERS
  // --------------------------------------
  console.log("📄 Inserting orders and related data...");

  // Contadores globales para evitar IDs duplicados
  let globalTaskId = 1;
  let globalTaskPartId = 1;
  let globalPhotoId = 1;
  let globalStatusHistoryId = 1;

  const ordersToCreate = [
    {
      id: 1,
      draft: false,
      type: "PRE_AUTORIZACION",
      creationDate: new Date(2025, 0, 15),
      customerId: 1,
      vehicleVin: "VIN00001",
      companyId: 3,
      userId: 3,
      status: "PENDIENTE",
      internalStatus: "PENDIENTE_RECLAMO",
      actualMileage: 12500,
      diagnosis: "Diagnóstico inicial: Falla en el sistema de frenos.",
      additionalObservations: "El cliente reporta chirrido al frenar a baja velocidad."
    },
    {
      id: 2,
      type: "RECLAMO",
      draft: false,
      creationDate: new Date(2025, 1, 20),
      customerId: 2,
      vehicleVin: "VIN00002",
      companyId: 7,
      userId: 3,
      status: "AUTORIZADO",
      internalStatus: "APROBADO_EN_ORIGEN",
      actualMileage: 35000,
      diagnosis: "Inspección de motor: se detecta fuga de aceite en el cárter.",
      additionalObservations: "Se recomienda cambiar el filtro y la junta."
    },
    {
      id: 3,
      type: "SERVICIO",
      draft: false,
      creationDate: new Date(2025, 2, 10),
      customerId: 3,
      vehicleVin: "VIN00003",
      companyId: 4,
      userId: 4,
      status: "COMPLETADO",
      internalStatus: "CARGADO",
      actualMileage: 50000,
      diagnosis: "Revisión completa de la suspensión y alineación.",
      additionalObservations: "El cliente reporta inestabilidad en la conducción."
    },
    {
      id: 4,
      draft: false,
      type: "PRE_AUTORIZACION",
      creationDate: new Date(2025, 3, 5),
      customerId: 1,
      vehicleVin: "VIN00004",
      companyId: 9,
      userId: 5,
      status: "RECHAZADO",
      internalStatus: "RECHAZADO_EN_ORIGEN",
      actualMileage: 22000,
      diagnosis: "Problema eléctrico en luces delanteras. Se requiere cambio de batería.",
      additionalObservations: "La batería no está cubierta por la garantía."
    },
    // BORRADORES
    {
      id: 5,
      draft: true,
      type: "PRE_AUTORIZACION",
      creationDate: new Date(2025, 0, 15),
      customerId: 1,
      vehicleVin: "VIN00001",
      companyId: 3,
      userId: 3,
      status: "PENDIENTE",
      internalStatus: "PENDIENTE_RECLAMO",
      actualMileage: 12500,
      diagnosis: "Diagnóstico inicial: Falla en el sistema de frenos.",
      additionalObservations: "El cliente reporta chirrido al frenar a baja velocidad."
    },
    {
      id: 6,
      draft: true,
      type: "RECLAMO",
      creationDate: new Date(2025, 1, 20),
      customerId: 2,
      vehicleVin: "VIN00002",
      companyId: 7,
      userId: 3,
      status: "PENDIENTE",
      internalStatus: "CARGADO",
      actualMileage: 35000,
      diagnosis: "Inspección de motor: se detecta fuga de aceite en el cárter.",
      additionalObservations: "Se recomienda cambiar el filtro y la junta."
    },
    {
      id: 7,
      draft: true,
      type: "SERVICIO",
      creationDate: new Date(2025, 2, 10),
      customerId: 3,
      vehicleVin: "VIN00003",
      companyId: 4,
      userId: 4,
      status: "PENDIENTE",
      internalStatus: "CARGADO",
      actualMileage: 50000,
      diagnosis: "Revisión completa de la suspensión y alineación.",
      additionalObservations: "El cliente reporta inestabilidad en la conducción."
    },
    {
      id: 8,
      draft: true,
      type: "PRE_AUTORIZACION",
      creationDate: new Date(2025, 3, 5),
      customerId: 1,
      vehicleVin: "VIN00004",
      companyId: 9,
      userId: 5,
      status: "PENDIENTE",
      internalStatus: "PENDIENTE_RECLAMO",
      actualMileage: 22000,
      diagnosis: "Problema eléctrico en luces delanteras. Se requiere cambio de batería.",
      additionalObservations: "La batería no está cubierta por la garantía."
    },
    {
      id: 9,
      type: "RECLAMO",
      draft: false,
      creationDate: new Date(2025, 1, 20),
      customerId: 2,
      vehicleVin: "VIN00002",
      companyId: 7,
      userId: 3,
      status: "PENDIENTE",
      internalStatus: "PENDIENTE_RECLAMO",
      actualMileage: 35000,
      diagnosis: "Inspección de motor: se detecta fuga de aceite en el cárter.",
      additionalObservations: "Se recomienda cambiar el filtro y la junta."
    },
    {
      id: 10,
      draft: false,
      type: "PRE_AUTORIZACION",
      creationDate: new Date(2025, 3, 5),
      customerId: 1,
      vehicleVin: "VIN00004",
      companyId: 9,
      userId: 5,
      status: "PENDIENTE",
      internalStatus: "PENDIENTE_RECLAMO",
      actualMileage: 22000,
      diagnosis: "Problema eléctrico en luces delanteras. Se requiere cambio de batería.",
      additionalObservations: "La batería no está cubierta por la garantía."
    },
    {
      id: 11,
      draft: false,
      type: "PRE_AUTORIZACION",
      creationDate: new Date(2025, 3, 7),
      customerId: 1,
      vehicleVin: "VIN00004",
      companyId: 9,
      userId: 5,
      status: "AUTORIZADO",
      internalStatus: "APROBADO_EN_ORIGEN",
      actualMileage: 22000,
      diagnosis: "Problema eléctrico en luces delanteras. Se requiere cambio de batería.",
      additionalObservations: "La batería no está cubierta por la garantía."
    },
  ];

  const orders = {};
  for (const orderData of ordersToCreate) {
    const order = await prisma.order.create({ data: orderData });
    orders[orderData.id] = order;

    // CREATE TASKS - IDs FIJOS usando contadores globales
    if (order.type === 'PRE_AUTORIZACION') {
      const task1 = await prisma.orderTask.create({
        data: {
          id: globalTaskId++,
          orderId: order.id,
          description: "Reemplazo de pastillas de freno delanteras.",
          hoursCount: 2,
          parts: {
            create: {
              id: globalTaskPartId++,
              partId: 4, // BUF004
              quantity: 1,
              description: "Pastillas de freno marca XYZ."
            }
          }
        }
      });
    } else if (order.type === 'RECLAMO') {
      const task1 = await prisma.orderTask.create({
        data: {
          id: globalTaskId++,
          orderId: order.id,
          description: "Cambio de aceite y filtro.",
          hoursCount: 1,
          parts: {
            create: {
              id: globalTaskPartId++,
              partId: 1, // FIL001
              quantity: 1,
              description: "Filtro de aceite premium."
            }
          }
        }
      });
      const task2 = await prisma.orderTask.create({
        data: {
          id: globalTaskId++,
          orderId: order.id,
          description: "Revisión y ajuste del sistema de suspensión.",
          hoursCount: 3
        }
      });
    }

    // CREATE PHOTOS - IDs FIJOS usando contadores globales
    const photosData = [
      { id: globalPhotoId++, orderId: order.id, type: "license_plate", url: `https://example.com/photos/patente-${order.orderNumber}.jpg` },
      { id: globalPhotoId++, orderId: order.id, type: "vin_plate", url: `https://example.com/photos/vin-${order.orderNumber}.jpg` },
      { id: globalPhotoId++, orderId: order.id, type: "odometer", url: `https://example.com/photos/kilometros-${order.orderNumber}.jpg` },
      { id: globalPhotoId++, orderId: order.id, type: "extra", url: `https://example.com/photos/extra-${order.orderNumber}.jpg` },
    ];
    await prisma.orderPhoto.createMany({ data: photosData });

    // CREATE STATUS HISTORY - IDs FIJOS usando contadores globales
    const initialStatus = {
      id: globalStatusHistoryId++,
      orderId: order.id,
      status: "PENDIENTE",
      changedAt: new Date(order.creationDate.getTime() - 1000 * 60 * 60 * 24 * 7)
    };
    await prisma.orderStatusHistory.create({ data: initialStatus });

    if (order.status === 'AUTORIZADO') {
      await prisma.orderStatusHistory.create({
        data: {
          id: globalStatusHistoryId++,
          orderId: order.id,
          status: "AUTORIZADO",
          changedAt: new Date()
        }
      });
    } else if (order.status === 'COMPLETADO') {
      await prisma.orderStatusHistory.create({
        data: {
          id: globalStatusHistoryId++,
          orderId: order.id,
          status: "AUTORIZADO",
          changedAt: new Date(order.creationDate.getTime() + 1000 * 60 * 60 * 24 * 2)
        }
      });
      await prisma.orderStatusHistory.create({
        data: {
          id: globalStatusHistoryId++,
          orderId: order.id,
          status: "COMPLETADO",
          changedAt: new Date()
        }
      });
    } else if (order.status === 'RECHAZADO') {
      await prisma.orderStatusHistory.create({
        data: {
          id: globalStatusHistoryId++,
          orderId: order.id,
          status: "RECHAZADO",
          changedAt: new Date()
        }
      });
    }
  }

  console.log("✅ Orders and related data inserted");


  // --------------------------------------
  // Warranties
  // --------------------------------------
  console.log("🛡 Inserting warranties...");
  const warrantiesData = [];
  for (let i = 1; i <= 20; i++) {
    warrantiesData.push({
      id: i,
      activationDate: new Date(2023 + Math.floor(i / 10), i % 12, i + 1),
      vehicleVin: `VIN${i.toString().padStart(5, "0")}`,
      companyId: companiesData[i % companiesData.length].id,
      userId: usersData[i % usersData.length].id,
      customerId: customersData[i % customersData.length].id
    });
  }
  await prisma.warranty.createMany({ data: warrantiesData });
  console.log("✅ Warranties inserted");

  console.log("🎉 Seed completed!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });