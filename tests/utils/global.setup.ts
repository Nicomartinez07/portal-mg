// prisma/globalSetup.js
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Usar 'bcryptjs' para mejor compatibilidad

// Reorganizamos las variables globales y el cliente de Prisma para una mejor gestión
const prisma = new PrismaClient();
let roles = [];
let companies = [];
let users = [];
let customers = [];
let vehicles = [];
let createdParts = [];

export default async () => {
  console.log("🛠️ Running global setup for tests...");

  try {
    // La conexión se maneja automáticamente por la primera llamada.
    await clean_database();
    await create_roles();
    await create_companies();
    await create_users();
    await assign_users();
    await create_clients();
    await create_cars();
    await create_and_assign_contacts_to_parts();
    await create_orders();
    await create_warranties();
    
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    process.exit(1); // Salir con error si algo falla
  } finally {
    await prisma.$disconnect();
    console.log("✅ Global setup complete!");
  }
};

export const clean_database = async () => {
  console.log("🧹 Cleaning database...");
  await prisma.$transaction([
    prisma.userRole.deleteMany(),
    prisma.orderTaskPart.deleteMany(),
    prisma.orderTask.deleteMany(),
    prisma.orderPhoto.deleteMany(),
    prisma.orderStatusHistory.deleteMany(),
    prisma.order.deleteMany(),
    prisma.warranty.deleteMany(),
    prisma.part.deleteMany(),
    prisma.partContact.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
    prisma.vehicle.deleteMany(),
    prisma.company.deleteMany(),
    prisma.customer.deleteMany(),
  ]);
  console.log("✅ Database cleaned");
  
};

const create_roles = async () => {
  console.log("🛠 Inserting roles...");
  const rolesData = ["ADMIN", "IMPORTER", "DEALER", "WORKSHOP"];
  for (const name of rolesData) {
    const role = await prisma.role.create({ data: { name } });
    roles[name] = role;
  }
  console.log("✅ Roles inserted");
};

const create_companies = async () => {
  console.log("🏢 Inserting companies...");
  const companiesData = [
    { name: "Southern Importer", address: "123 Evergreen Ave", state: "Buenos Aires", city: "La Plata", phone1: "123456789", companyType: "Importer" },
    { name: "Northern Dealership", address: "456 Fake St", state: "Córdoba", city: "Córdoba", phone1: "1122334455", companyType: "Dealer" },
    { name: "Central Workshop", address: "789 Central Ave", state: "Buenos Aires", city: "La Plata", phone1: "2233445566", companyType: "Workshop", manager: "Roberto García" },
    { name: "Western Dealership", address: "101 West St", state: "Mendoza", city: "Mendoza", phone1: "3344556677", companyType: "Dealer" },
    { name: "Eastern Importer", address: "202 East Ave", state: "Santa Fe", city: "Rosario", phone1: "4455667788", companyType: "Importer" },
    { name: "Taller Mecánico Rápido", address: "Av. Siempre Viva 742", state: "Buenos Aires", city: "La Plata", phone1: "2214567890", companyType: "Workshop", manager: "Carlos Mendoza" },
    { name: "AutoService Premium", address: "Calle Falsa 123", state: "Córdoba", city: "Córdoba", phone1: "3519876543", companyType: "Workshop", manager: "María López" },
    { name: "Mecánica Express", address: "Ruta 8 Km 65", state: "Buenos Aires", city: "Mercedes", phone1: "2324455667", companyType: "Workshop", manager: "Juan Pérez" },
    { name: "Taller del Sur", address: "Av. San Martín 567", state: "Santa Fe", city: "Rosario", phone1: "3412345678", companyType: "Workshop", manager: "Ana Rodríguez" },
    { name: "Service Automotor", address: "Belgrano 890", state: "Mendoza", city: "Mendoza", phone1: "2613456789", companyType: "Workshop", manager: "Pedro González" }
  ];
  
  companies = await prisma.$transaction(
    companiesData.map(data => prisma.company.create({ data }))
  );
  console.log("✅ Companies inserted");
};

const create_users = async () => {
  console.log("👤 Inserting users...");
  const SALT_ROUNDS = 10;
  const usersData = [
    { username: "Admin", email: "admin@company.com", notifications: true, password: await bcrypt.hash("Admin123!", SALT_ROUNDS), companyId: companies[0].id },
    { username: "John Smith", email: "john@smith.com", notifications: true, password: await bcrypt.hash("John123!", SALT_ROUNDS), companyId: companies[1].id },
    { username: "Mary Johnson", email: "mary@johnson.com", notifications: false, password: await bcrypt.hash("Mary123!", SALT_ROUNDS), companyId: companies[2].id },
    { username: "Mati PEDAZO DE GIL", email: "marAy@johnson.com", notifications: false, password: await bcrypt.hash("Marya123!", SALT_ROUNDS), companyId: companies[2].id },
    { username: "Carlos Brown", email: "carlos@brown.com", notifications: false, password: await bcrypt.hash("Carlos123!", SALT_ROUNDS), companyId: companies[3].id },
    { username: "Laura Wilson", email: "laura@wilson.com", notifications: true, password: await bcrypt.hash("Laura123!", SALT_ROUNDS), companyId: companies[4].id }
  ];
  users = await prisma.$transaction(
    usersData.map(data => prisma.user.create({ data }))
  );
  console.log("✅ Users inserted");
};

const assign_users = async () => {
  console.log("🔗 Assigning roles to users...");
  await prisma.userRole.createMany({
    data: [
      { userId: users[0].id, roleId: roles["ADMIN"].id },
      { userId: users[1].id, roleId: roles["DEALER"].id },
      { userId: users[2].id, roleId: roles["WORKSHOP"].id },
      { userId: users[3].id, roleId: roles["DEALER"].id },
      { userId: users[4].id, roleId: roles["WORKSHOP"].id }
    ]
  });
  console.log("✅ Roles assigned to users");
};

const create_clients = async () => {
  console.log("🧑‍🤝‍🧑 Inserting customers...");
  const customersData = [
    { firstName: "Peter", lastName: "Gomez", email: "peter@gmail.com", phone: "111222333", address: "123 A St", state: "Buenos Aires", city: "La Plata" },
    { firstName: "Anna", lastName: "Martinez", email: "anna@gmail.com", phone: "444555666", address: "456 B St", state: "Córdoba", city: "Córdoba" },
    { firstName: "Louis", lastName: "Rodriguez", email: "louis@gmail.com", phone: "777888999", address: "789 C St", state: "Mendoza", city: "Mendoza" }
  ];
  customers = await prisma.$transaction(
    customersData.map(data => prisma.customer.create({ data }))
  );
  console.log("✅ Customers inserted");
};

const create_cars = async () => {
  console.log("🚗 Inserting vehicles...");
  const vehiclesData = [];
  for (let i = 1; i <= 20; i++) {
    vehiclesData.push({
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
      blocked: true
    });
  }
  vehicles = await prisma.$transaction(
    vehiclesData.map(data => prisma.vehicle.create({ data }))
  );
  console.log("✅ Vehicles inserted");
};

const create_and_assign_contacts_to_parts = async () => {
  console.log("📞 Inserting part contact...");
  const partContact = await prisma.partContact.create({
    data: {
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
    { code: "FIL001", description: "Filtro de Aceite Premium", model: "FP-1000", stock: 25, salePrice: 45.99, companyId: companies[0].id, contactId: partContact.id },
    { code: "BAT002", description: "Batería 12V 60Ah", model: "BT-6000", stock: 15, salePrice: 189.50, companyId: companies[1].id, contactId: partContact.id },
    { code: "DIS003", description: "Juego de Discos de Freno", model: "DF-2023", stock: 8, salePrice: 320.75, companyId: companies[2].id, contactId: partContact.id },
    { code: "BUF004", description: "Pastillas de Freno Delanteras", model: "PF-D500", stock: 30, salePrice: 87.25, companyId: companies[3].id, contactId: partContact.id },
    { code: "ACE005", description: "Aceite Sintético 5W30", model: "OIL-S5W30", stock: 50, salePrice: 65.00, companyId: companies[4].id, contactId: partContact.id }
  ];

  createdParts = await prisma.$transaction(
    partsData.map(p => prisma.part.create({
      data: {
        ...p,
        loadDate: new Date()
      }
    }))
  );
  console.log("✅ Parts inserted");
};

const create_orders = async () => {
  console.log("📄 Inserting orders and related data...");
  const ordersToCreate = [
    {
      id: 100, 
      type: "PRE_AUTORIZACION",
      creationDate: new Date(2025, 0, 15),
      customerId: customers[0].id,
      vehicleVin: vehicles[0].vin,
      companyId: companies[2].id,
      userId: users[2].id,
      status: "PENDIENTE",
      internalStatus: "PENDIENTE_RECLAMO",
      actualMileage: 12500,
      diagnosis: "Diagnóstico inicial: Falla en el sistema de frenos.",
      additionalObservations: "El cliente reporta chirrido al frenar a baja velocidad."
    },
    {
      id: 101,
      type: "RECLAMO",
      creationDate: new Date(2025, 1, 20),
      customerId: customers[1].id,
      vehicleVin: vehicles[1].vin,
      companyId: companies[6].id,
      userId: users[2].id,
      status: "AUTORIZADO",
      internalStatus: "APROBADO_EN_ORIGEN",
      actualMileage: 35000,
      diagnosis: "Inspección de motor: se detecta fuga de aceite en el cárter.",
      additionalObservations: "Se recomienda cambiar el filtro y la junta."
    },
    {
      id: 102,
      type: "SERVICIO",
      creationDate: new Date(2025, 2, 10),
      customerId: customers[2].id,
      vehicleVin: vehicles[2].vin,
      companyId: companies[3].id,
      userId: users[3].id,
      status: "COMPLETADO",
      internalStatus: "CARGADO",
      actualMileage: 50000,
      diagnosis: "Revisión completa de la suspensión y alineación.",
      additionalObservations: "El cliente reporta inestabilidad en la conducción."
    },
    {
      id: 103,
      type: "PRE_AUTORIZACION",
      creationDate: new Date(2025, 3, 5),
      customerId: customers[0].id,
      vehicleVin: vehicles[3].vin,
      companyId: companies[8].id,
      userId: users[4].id,
      status: "RECHAZADO",
      internalStatus: "RECHAZADO_EN_ORIGEN",
      actualMileage: 22000,
      diagnosis: "Problema eléctrico en luces delanteras. Se requiere cambio de batería.",
      additionalObservations: "La batería no está cubierta por la garantía."
    }
  ];

  for (const orderData of ordersToCreate) {
    const order = await prisma.order.create({ data: orderData });

    if (order.type === 'PRE_AUTORIZACION') {
      const part = createdParts.find(p => p.code === "BUF004");
      if (part) {
        await prisma.orderTask.create({
          data: {
            orderId: order.id,
            description: "Reemplazo de pastillas de freno delanteras.",
            hoursCount: 2,
            parts: {
              create: {
                partId: part.id,
                quantity: 1,
                description: "Pastillas de freno marca XYZ."
              }
            }
          }
        });
      }
    } else if (order.type === 'RECLAMO') {
      const part = createdParts.find(p => p.code === "FIL001");
      if (part) {
        await prisma.orderTask.create({
          data: {
            orderId: order.id,
            description: "Cambio de aceite y filtro.",
            hoursCount: 1,
            parts: {
              create: {
                partId: part.id,
                quantity: 1,
                description: "Filtro de aceite premium."
              }
            }
          }
        });
      }
      await prisma.orderTask.create({
        data: {
          orderId: order.id,
          description: "Revisión y ajuste del sistema de suspensión.",
          hoursCount: 3
        }
      });
    }

    const photosData = [
      { orderId: order.id, type: "license_plate", url: `https://example.com/photos/patente-${order.id}.jpg` },
      { orderId: order.id, type: "vin_plate", url: `https://example.com/photos/vin-${order.id}.jpg` },
      { orderId: order.id, type: "odometer", url: `https://example.com/photos/kilometros-${order.id}.jpg` },
      { orderId: order.id, type: "extra", url: `https://example.com/photos/extra-${order.id}.jpg` },
    ];
    await prisma.orderPhoto.createMany({ data: photosData });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "PENDIENTE",
        changedAt: new Date(order.creationDate.getTime() - 1000 * 60 * 60 * 24 * 7)
      }
    });

    if (order.status === 'AUTORIZADO') {
      await prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: "AUTORIZADO", changedAt: new Date() }
      });
    } else if (order.status === 'COMPLETADO') {
      await prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: "AUTORIZADO", changedAt: new Date(order.creationDate.getTime() + 1000 * 60 * 60 * 24 * 2) }
      });
      await prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: "COMPLETADO", changedAt: new Date() }
      });
    } else if (order.status === 'RECHAZADO') {
      await prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: "RECHAZADO", changedAt: new Date() }
      });
    }
  }

  console.log("✅ Orders and related data inserted");
};

const create_warranties = async () => {
  console.log("🛡 Inserting warranties...");
  const warrantiesData = [];
  const customerCount = customers.length;
  for (let i = 0; i < 20; i++) {
    warrantiesData.push({
      activationDate: new Date(2023 + Math.floor(i / 10), i % 12, i + 1),
      vehicleVin: vehicles[i].vin,
      companyId: companies[i % companies.length].id,
      userId: users[i % users.length].id,
      customerId: customers[i % customerCount].id
    });
  }
  await prisma.warranty.createMany({ data: warrantiesData });
  console.log("✅ Warranties inserted");
};