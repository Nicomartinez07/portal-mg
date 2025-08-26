const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log("🧹 Cleaning database...");

  // Delete tables in correct order due to FK constraints
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

  console.log("✅ Database cleaned");

  // --------------------------------------
  // Roles
  // --------------------------------------
  console.log("🛠 Inserting roles...");
  const rolesData = ["ADMIN", "IMPORTER", "DEALER", "WORKSHOP"];
  const roles = {};
  for (const name of rolesData) {
    const role = await prisma.role.create({ data: { name } });
    roles[name] = role;
  }
  console.log("✅ Roles inserted");

  // --------------------------------------
  // Companies - CON NUEVOS TALLERES Y ENCARGADOS
  // --------------------------------------
  console.log("🏢 Inserting companies...");
  const companiesData = [
    // Companies originales
    { name: "Southern Importer", address: "123 Evergreen Ave", state: "Buenos Aires", city: "La Plata", phone1: "123456789", phone2: "987654321", email: "contact@importer.com", companyType: "Importer" },
    { name: "Northern Dealership", address: "456 Fake St", state: "Córdoba", city: "Córdoba", phone1: "1122334455", phone2: "5544332211", email: "sales@dealership.com", companyType: "Dealer" },
    { name: "Central Workshop", address: "789 Central Ave", state: "Buenos Aires", city: "La Plata", phone1: "2233445566", phone2: "6655443322", email: "contact@centralworkshop.com", companyType: "Workshop", manager: "Roberto García" },
    { name: "Western Dealership", address: "101 West St", state: "Mendoza", city: "Mendoza", phone1: "3344556677", phone2: "7766554433", email: "sales@westerndealer.com", companyType: "Dealer" },
    { name: "Eastern Importer", address: "202 East Ave", state: "Santa Fe", city: "Rosario", phone1: "4455667788", phone2: "8877665544", email: "contact@easternimporter.com", companyType: "Importer" },
    
    // NUEVOS TALLERES (Workshops)
    { name: "Taller Mecánico Rápido", address: "Av. Siempre Viva 742", state: "Buenos Aires", city: "La Plata", phone1: "2214567890", email: "info@tallerrapido.com", companyType: "Workshop", manager: "Carlos Mendoza" },
    { name: "AutoService Premium", address: "Calle Falsa 123", state: "Córdoba", city: "Córdoba", phone1: "3519876543", email: "contacto@autopremium.com", companyType: "Workshop", manager: "María López" },
    { name: "Mecánica Express", address: "Ruta 8 Km 65", state: "Buenos Aires", city: "Mercedes", phone1: "2324455667", email: "mecanicaexpress@hotmail.com", companyType: "Workshop", manager: "Juan Pérez" },
    { name: "Taller del Sur", address: "Av. San Martín 567", state: "Santa Fe", city: "Rosario", phone1: "3412345678", email: "tallerdelsur@gmail.com", companyType: "Workshop", manager: "Ana Rodríguez" },
    { name: "Service Automotor", address: "Belgrano 890", state: "Mendoza", city: "Mendoza", phone1: "2613456789", email: "serviceauto@yahoo.com", companyType: "Workshop", manager: "Pedro González" },
    { name: "Mecánica Integral", address: "Sarmiento 321", state: "Buenos Aires", city: "Bahía Blanca", phone1: "2914567890", email: "mecanicaintegral@outlook.com", companyType: "Workshop", manager: "Lucía Fernández" },
    { name: "Taller Specializado", address: "Mitre 654", state: "Córdoba", city: "Villa María", phone1: "3539876543", email: "specialized@taller.com", companyType: "Workshop", manager: "Diego Martínez" }
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
    { 
      username: "Admin", 
      email: "admin@company.com", 
      notifications: true, 
      password: await bcrypt.hash("Admin123!", SALT_ROUNDS),
      companyId: companies[0].id 
    },
    { 
      username: "John Smith", 
      email: "john@smith.com", 
      notifications: true, 
      password: await bcrypt.hash("John123!", SALT_ROUNDS),
      companyId: companies[1].id 
    },
    { 
      username: "Mary Johnson", 
      email: "mary@johnson.com", 
      notifications: false, 
      password: await bcrypt.hash("Mary123!", SALT_ROUNDS),
      companyId: companies[2].id 
    },
    { 
      username: "Carlos Brown", 
      email: "carlos@brown.com", 
      notifications: false, 
      password: await bcrypt.hash("Carlos123!", SALT_ROUNDS),
      companyId: companies[3].id 
    },
    { 
      username: "Laura Wilson", 
      email: "laura@wilson.com", 
      notifications: true, 
      password: await bcrypt.hash("Laura123!", SALT_ROUNDS),
      companyId: companies[4].id 
    }
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
  const assignments = [
    { user: users[0], role: roles["ADMIN"] },
    { user: users[1], role: roles["DEALER"] },
    { user: users[2], role: roles["WORKSHOP"] },
    { user: users[3], role: roles["DEALER"] },
    { user: users[4], role: roles["WORKSHOP"] }
  ];

  for (const a of assignments) {
    await prisma.userRole.create({
      data: {
        userId: a.user.id,
        roleId: a.role.id
      }
    });
  }
  console.log("✅ Roles assigned to users");

  // --------------------------------------
  // Customers
  // --------------------------------------
  console.log("🧑‍🤝‍🧑 Inserting customers...");
  const customersData = [
    { firstName: "Peter", lastName: "Gomez", email: "peter@gmail.com", phone: "111222333", address: "123 A St", state: "Buenos Aires", city: "La Plata" },
    { firstName: "Anna", lastName: "Martinez", email: "anna@gmail.com", phone: "444555666", address: "456 B St", state: "Córdoba", city: "Córdoba" },
    { firstName: "Louis", lastName: "Rodriguez", email: "louis@gmail.com", phone: "777888999", address: "789 C St", state: "Mendoza", city: "Mendoza" }
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
      licensePlate: `ABC${i}XYZ`
    });
  }
  const vehicles = await prisma.$transaction(
    vehiclesData.map((v) => prisma.vehicle.create({ data: v }))
  );
  console.log("✅ Vehicles inserted");

  // --------------------------------------
  // Orders
  // --------------------------------------
  console.log("📄 Inserting orders...");
  const ordersData = [
    {
      creationDate: new Date(),
      customerId: customers[0].id,
      vehicleVin: vehicles[0].vin,
      companyId: companies[1].id,
      userId: users[1].id,
      status: "In progress",
      internalStatus: "Pending",
      actualMileage: 1000,
      diagnosis: "General check",
      additionalObservations: "None",
      tasks: "Oil change",
      hoursCount: 2,
      parts: "Oil filter",
      partsDescription: "Filter model X"
    },
    {
      creationDate: new Date(),
      customerId: customers[1].id,
      vehicleVin: vehicles[1].vin,
      companyId: companies[3].id,
      userId: users[3].id,
      status: "Completed",
      internalStatus: "Ready",
      actualMileage: 5000,
      diagnosis: "Brake inspection",
      additionalObservations: "All OK",
      tasks: "Brake pad inspection and replacement",
      hoursCount: 3,
      parts: "Brake pads",
      partsDescription: "Brand Y pads"
    }
  ];
  for (const o of ordersData) {
    await prisma.order.create({ data: o });
  }
  console.log("✅ Orders inserted");

  // --------------------------------------
  // Warranties
  // --------------------------------------
  console.log("🛡 Inserting warranties...");
  const warrantiesData = [];
  const customerCount = customers.length;

  for (let i = 0; i < 15; i++) {
    warrantiesData.push({
      activationDate: new Date(2023, i % 12, 10),
      vehicleVin: vehicles[i].vin,
      companyId: companies[i % companies.length].id,
      userId: users[i % users.length].id,
      customerId: customers[i % customerCount].id
    });
  }

  for (let i = 15; i < 18; i++) {
    warrantiesData.push({
      activationDate: new Date(2024, (i - 15) * 3, 5),
      vehicleVin: vehicles[i].vin,
      companyId: companies[1].id,
      userId: users[1].id,
      customerId: customers[(i - 15) % customerCount].id
    });
  }

  for (let i = 18; i < 20; i++) {
    warrantiesData.push({
      activationDate: new Date(2025, (i - 18) * 2, 20),
      vehicleVin: vehicles[i].vin,
      companyId: companies[2].id,
      userId: users[2].id,
      customerId: customers[(i - 18) % customerCount].id
    });
  }

  await prisma.warranty.createMany({ data: warrantiesData });
  console.log("✅ Warranties inserted");

  // --------------------------------------
  // PartContact (UN SOLO CONTACTO PARA TODOS LOS REPUESTOS)
  // --------------------------------------
  console.log("📞 Inserting part contact...");
  const partContact = await prisma.partContact.create({
    data: {
      contactName: "Proveedor Central de Repuestos",
      address: "Av. Industrial 1234",
      state: "Buenos Aires",
      city: "La Plata",
      phone1: "2211234567",
      phone2: "2217654321",
      email: "repuestos@proveedorcentral.com"
    }
  });
  console.log("✅ Part contact inserted");

  // --------------------------------------
  // Parts (10 REPUESTOS)
  // --------------------------------------
  console.log("🔧 Inserting parts...");
  const partsData = [
    { code: "FIL001", description: "Filtro de Aceite Premium", model: "FP-1000", stock: 25, salePrice: 45.99, companyId: companies[0].id, contactId: partContact.id },
    { code: "BAT002", description: "Batería 12V 60Ah", model: "BT-6000", stock: 15, salePrice: 189.50, companyId: companies[1].id, contactId: partContact.id },
    { code: "DIS003", description: "Juego de Discos de Freno", model: "DF-2023", stock: 8, salePrice: 320.75, companyId: companies[2].id, contactId: partContact.id },
    { code: "BUF004", description: "Pastillas de Freno Delanteras", model: "PF-D500", stock: 30, salePrice: 87.25, companyId: companies[3].id, contactId: partContact.id },
    { code: "ACE005", description: "Aceite Sintético 5W30", model: "OIL-S5W30", stock: 50, salePrice: 65.00, companyId: companies[4].id, contactId: partContact.id },
    { code: "COR006", description: "Correa de Distribución", model: "CD-800", stock: 12, salePrice: 95.40, companyId: companies[5].id, contactId: partContact.id },
    { code: "BOM007", description: "Bomba de Agua", model: "BA-350", stock: 6, salePrice: 210.30, companyId: companies[6].id, contactId: partContact.id },
    { code: "RAD008", description: "Radiador Aluminio", model: "RAD-A200", stock: 4, salePrice: 450.00, companyId: companies[7].id, contactId: partContact.id },
    { code: "BUF009", description: "Amortiguadores Delanteros", model: "AMT-D1", stock: 10, salePrice: 380.90, companyId: companies[8].id, contactId: partContact.id },
    { code: "EMB010", description: "Embrague Completo", model: "EMB-C300", stock: 7, salePrice: 520.60, companyId: companies[9].id, contactId: partContact.id }
  ];

  await prisma.part.createMany({ 
    data: partsData.map(part => ({
      ...part,
      loadDate: new Date()
    }))
  });
  console.log("✅ Parts inserted");

  console.log("🎉 Seed completed!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });