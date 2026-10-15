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
  it("explains when the restricted default mailer rejects public addresses",()=>{
    expect(signupFailure({code:"email_address_not_authorized",message:"Email address not authorized"})).toBe("restricted_email");
    expect(signupMessages.restricted_email).toContain("Custom SMTP");
  });
  it("keeps unknown provider failures generic",()=>{
    expect(signupFailure({code:"unknown_provider_error",message:"internal detail"})).toBe("failed");
  });
});
