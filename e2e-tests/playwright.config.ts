import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Auto-start frontend before tests
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../shell',
      port: 3000,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: process.env.CI ? 'python -m uvicorn main:app --port 8000' : 'py -3.12 -m uvicorn main:app --port 8000',
      cwd: '../backend',
      port: 8000,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
})
