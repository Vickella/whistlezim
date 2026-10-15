import { describe, expect, it } from "vitest";
import { signupFailure, signupMessages } from "@/lib/auth/signup-error";

describe("signup error handling",()=>{
  it("turns provider rate limits into an actionable message",()=>{
    expect(signupFailure({code:"over_email_send_rate_limit",status:429})).toBe("rate_limit");
    expect(signupMessages.rate_limit).toContain("60 seconds");
  });
  it("identifies SMTP delivery failures without exposing provider internals",()=>{
    expect(signupFailure({code:"unexpected_failure",message:"Error sending confirmation email",status:500})).toBe("email_delivery");
  });
  it("keeps unknown provider failures generic",()=>{
    expect(signupFailure({code:"unknown_provider_error",message:"internal detail"})).toBe("failed");
  });
});
