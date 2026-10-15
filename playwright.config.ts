import { defineConfig,devices } from "@playwright/test";
const launchOptions = process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } } : {};
export default defineConfig({testDir:"./tests/e2e",webServer:{command:"npm run dev",url:"http://127.0.0.1:3000",reuseExistingServer:true},use:{baseURL:"http://127.0.0.1:3000",trace:"retain-on-failure"},projects:[{name:"chromium",use:{...devices["Desktop Chrome"],...launchOptions}},{name:"mobile",use:{...devices["Pixel 7"],...launchOptions}}]});
