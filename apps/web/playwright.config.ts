import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'bun run --watch src/index.ts',
      cwd: '../server',
      port: 3001,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'bun run vite --port 5199',
      port: 5199,
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
})
