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

test("organisation signup explains the secure setup flow",async({page})=>{
  await page.goto("/register");
  await expect(page.getByRole("heading",{name:"Create your workspace"})).toBeVisible();
  await expect(page.getByLabel("Work email")).toBeVisible();
  await expect(page.getByRole("button",{name:"Create secure account"})).toBeVisible();
  await expect(page.getByText("Verify and protect access")).toBeVisible();
  await expect(page.locator("form.auth-form")).toHaveAttribute("method","post");
  await expect(page.locator("form.auth-form")).toHaveAttribute("action","/auth/signup");
});

test("signup passwords can be viewed without leaking into the URL",async({page})=>{
  await page.goto("/register");
  const password = page.getByLabel("Create password");
  await password.fill("A secure example password 2026");
  await expect(password).toHaveAttribute("type","password");
  await page.getByRole("button",{name:"Show"}).first().click();
  await expect(password).toHaveAttribute("type","text");
  await page.getByLabel("Work email").fill("owner@example.com");
  await page.getByLabel("Confirm password").fill("A different secure password");
  await page.getByRole("checkbox").check();
  await page.getByRole("button",{name:"Create secure account"}).click();
  await expect(page.getByText("The passwords do not match.")).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
  expect(page.url()).not.toContain("password");
});

test("signup has a secure server fallback",async({request,baseURL})=>{
  const response = await request.post("/auth/signup",{
    headers:{Origin:baseURL!},
    form:{email:"owner@example.com",password:"A secure example password 2026",passwordConfirmation:"A different secure password",terms:"on"},
    maxRedirects:0
  });
  expect(response.status()).toBe(303);
  const location = new URL(response.headers().location);
  expect(`${location.pathname}${location.search}`).toBe("/register?error=invalid_details");
  expect(location.href).not.toContain("password");
});

test("production CSP nonce is attached to application scripts",async({request})=>{
  const response = await request.get("/register");
  const policy = response.headers()["content-security-policy"];
  const html = await response.text();
  const policyNonce = policy.match(/nonce-([^']+)/)?.[1];
  const scriptNonce = html.match(/<script[^>]+nonce="([^"]+)"/)?.[1];
  expect(policyNonce).toBeTruthy();
  expect(scriptNonce).toBe(policyNonce);
  expect(response.headers()["cache-control"]).toContain("no-store");
});

test("legal centre provides structured policy navigation",async({page})=>{
  await page.goto("/legal");
  await expect(page.getByRole("heading",{name:"Legal centre"})).toBeVisible();
  await expect(page.getByRole("link",{name:/Privacy Notice/})).toBeVisible();
  await page.goto("/privacy");
  await expect(page.getByRole("navigation",{name:"Privacy Notice contents"})).toBeVisible();
  await expect(page.getByRole("heading",{name:/Anonymous reporting and pseudonymisation/})).toBeVisible();
  await expect(page.getByText("Version 1.1")).toBeVisible();
});
