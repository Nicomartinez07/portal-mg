// prisma/globalSetup.js
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async () => {
  // A simple check to see if we're in a test environment
  if (process.env.NODE_ENV === 'test') {
    console.log("🛠️ Running global setup for tests...");
    
    // Clean and reset the database
    execSync('npx prisma migrate reset --force --skip-seed');

    // Run the main seed script
    await require('./seed.js').main();

    // Disconnect from the database
    await prisma.$disconnect();

    console.log("✅ Global setup complete!");
  }
};