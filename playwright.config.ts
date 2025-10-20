// playwright.config.js

import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  // 2. AJUSTE: Cambia la ruta a los scripts que definimos en el paso anterior.
  // Asumiendo que están en la raíz del proyecto.
  globalSetup: "./tests/utils/globalSetup.js",
  globalTeardown: "./tests/utils/globalTeardown.js",

  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,

  /* Opt out of parallel tests on CI. */
  workers: 1, // Solo 1 worker - Prohibido paralelismo (consume mucha RAM/CPU)
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    storageState: 'tests/auth.json',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // Puedes habilitar otros navegadores aquí si quieres
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,

    env: {
      DATABASE_URL: "file:./test.db",
      JWT_SECRET: "contraseña_para_jwt", 
      NODE_ENV: "test"
    },
    // ---------------------------------
  },
});