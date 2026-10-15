import { test, expect } from "@playwright/test";

test("public reporting entry points are available",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("link",{name:"Submit a report",exact:true}).first()).toBeVisible();
  await expect(page.getByRole("link",{name:"Officer portal",exact:true}).first()).toBeVisible();
  await page.goto("/report");
  await expect(page.getByLabel("Organisation channel")).toBeVisible();
});

test("tracking form is keyboard accessible",async({page})=>{
  await page.goto("/track");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await expect(page.getByLabel("Case reference")).toBeVisible();
  await expect(page.getByLabel("Recovery secret")).toHaveAttribute("type","password");
});
