// playwright.config.js
import { defineConfig, devices } from '@playwright/test';
require('dotenv').config(); // Carga .env para que process.env tenga tus claves

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  // Rutas a tus scripts (las dejé como las tenías)
  globalSetup: "./tests/utils/globalSetup.js",
  globalTeardown: "./tests/utils/globalTeardown.js",

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,

  /* Workers: 1. Es crucial para tests que dependen de una DB única */
  workers: 1,
  
  reporter: 'html',

  /* Shared settings for all the projects below. */
  use: {
    baseURL: 'http://localhost:3000',
    storageState: 'tests/auth.json', // El auth state que genera globalSetup
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    // Reutiliza el servidor si ya está corriendo (ideal para dev local)
    reuseExistingServer: !process.env.CI,
    
    // ¡CORREGIDO!
    // Eliminamos la sección 'env'. El webServer (npm run dev)
    // debe usar tu archivo .env principal (el que usa root y portalmg_db)
  },
});