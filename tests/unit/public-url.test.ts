import { describe, expect, it } from "vitest";
import { publicAppUrl, signupCallbackUrl } from "@/lib/auth/public-url";

describe("public authentication URLs", () => {
  it("prefers the explicitly configured application URL", () => {
    expect(publicAppUrl("https://whistlezim.vercel.app/path", "preview.vercel.app")).toBe("https://whistlezim.vercel.app");
  });

  it("uses Vercel's production host instead of the active preview host", () => {
    expect(signupCallbackUrl("https://preview.vercel.app/register", undefined, "whistlezim.vercel.app"))
      .toBe("https://whistlezim.vercel.app/auth/callback?next=/dashboard/mfa");
  });

  it("falls back to the request origin outside Vercel", () => {
    expect(signupCallbackUrl("http://localhost:3000/register"))
      .toBe("http://localhost:3000/auth/callback?next=/dashboard/mfa");
  });

  it("rejects unsafe configured schemes", () => {
    expect(publicAppUrl("javascript:alert(1)")).toBeUndefined();
  });
});
