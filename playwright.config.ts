import { defineConfig,devices } from "@playwright/test";
const launchOptions = process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } } : {};
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const webServer = process.env.PLAYWRIGHT_BASE_URL ? undefined : { command: "npm run dev", url: baseURL, reuseExistingServer: true };
export default defineConfig({testDir:"./tests/e2e",webServer,use:{baseURL,trace:"retain-on-failure"},projects:[{name:"chromium",use:{...devices["Desktop Chrome"],...launchOptions}},{name:"mobile",use:{...devices["Pixel 7"],...launchOptions}}]});
