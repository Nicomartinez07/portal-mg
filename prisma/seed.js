const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  // Companies
  // --------------------------------------
  console.log("🏢 Inserting companies...");
  const companiesData = [
    { name: "Southern Importer", address: "123 Evergreen Ave", state: "Buenos Aires", city: "La Plata", phone1: "123456789", phone2: "987654321", email: "contact@importer.com", companyType: "Importer" },
    { name: "Northern Dealership", address: "456 Fake St", state: "Córdoba", city: "Córdoba", phone1: "1122334455", phone2: "5544332211", email: "sales@dealership.com", companyType: "Dealer" },
    { name: "Central Workshop", address: "789 Central Ave", state: "Buenos Aires", city: "La Plata", phone1: "2233445566", phone2: "6655443322", email: "contact@centralworkshop.com", companyType: "Workshop" },
    { name: "Western Dealership", address: "101 West St", state: "Mendoza", city: "Mendoza", phone1: "3344556677", phone2: "7766554433", email: "sales@westerndealer.com", companyType: "Dealer" },
    { name: "Eastern Importer", address: "202 East Ave", state: "Santa Fe", city: "Rosario", phone1: "4455667788", phone2: "8877665544", email: "contact@easternimporter.com", companyType: "Importer" }
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
 const bcrypt = require('bcrypt');
  const SALT_ROUNDS = 10; // Número de rondas para el salt (10-12 es un buen balance)

  const usersData = [
    { 
      username: "Admin", 
      email: "admin@company.com", 
      notifications: true, 
      password: await bcrypt.hash("Admin123!", SALT_ROUNDS), // Contraseña más segura
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
  for (let i = 1; i <= 10; i++) {
    vehiclesData.push({
      date: new Date(),
      vin: `VIN000${i}`,
      brand: `Brand${i}`,
      model: `Model${i}`,
      engineNumber: `Engine${i}`,
      type: "Sedan",
      year: 2020 + i % 3,
      certificateNumber: `CERT00${i}`,
      saleDate: new Date(),
      importDate: new Date(),
      licensePlate: `ABC${i}XYZ`
    });
  }
  const vehicles = [];
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.create({ data: v });
    vehicles.push(vehicle);
  }
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
  const warrantiesData = [
    { activationDate: new Date(), vehicleVin: vehicles[0].vin, companyId: companies[1].id, userId: users[1].id },
    { activationDate: new Date(), vehicleVin: vehicles[1].vin, companyId: companies[3].id, userId: users[3].id }
  ];
  for (const w of warrantiesData) {
    await prisma.warranty.create({ data: w });
  }
  console.log("✅ Warranties inserted");

  console.log("🎉 Seed completed!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });