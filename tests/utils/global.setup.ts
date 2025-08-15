// tests/global.setup.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export default async function globalSetup() {
  console.log('\n🧹 Empezando la configuraciond de la base de datos...');

  try {
    // Limpieza de la base de datos
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

    // --------------------------------------
    // Roles
    // --------------------------------------
    const rolesData = ["ADMIN", "IMPORTER", "DEALER", "WORKSHOP"];
    const roles: Record<string, any> = {};
    for (const name of rolesData) {
      const role = await prisma.role.create({ data: { name } });
      roles[name] = role;
    }

    // --------------------------------------
    // Companies
    // --------------------------------------
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

    // --------------------------------------
    // Users (con contraseñas hasheadas)
    // --------------------------------------
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

    // Asignación de roles
    await prisma.userRole.createMany({
      data: [
        { userId: users[0].id, roleId: roles["ADMIN"].id },
        { userId: users[1].id, roleId: roles["DEALER"].id },
        { userId: users[2].id, roleId: roles["WORKSHOP"].id },
        { userId: users[3].id, roleId: roles["DEALER"].id },
        { userId: users[4].id, roleId: roles["WORKSHOP"].id }
      ]
    });

    // --------------------------------------
    // Customers
    // --------------------------------------
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

    // --------------------------------------
    // Vehicles
    // --------------------------------------
    const vehiclesData = Array.from({ length: 10 }, (_, i) => ({
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
    }));

    const vehicles = [];
    for (const v of vehiclesData) {
      const vehicle = await prisma.vehicle.create({ data: v });
      vehicles.push(vehicle);
    }

    // --------------------------------------
    // Orders
    // --------------------------------------
    await prisma.order.createMany({
      data: [
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
      ]
    });

    // --------------------------------------
    // Warranties
    // --------------------------------------
    await prisma.warranty.createMany({
      data: [
        { activationDate: new Date(), vehicleVin: vehicles[0].vin, companyId: companies[1].id, userId: users[1].id },
        { activationDate: new Date(), vehicleVin: vehicles[1].vin, companyId: companies[3].id, userId: users[3].id }
      ]
    });

    console.log('✅ Base de datos configurada correctamente.');
  } catch (error) {
    console.error('❌ Error durante la configuración de la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}