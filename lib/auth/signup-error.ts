type AuthFailure = { code?: string; message?: string; status?: number };

export type SignupFailure = "rate_limit" | "email_delivery" | "existing_account" | "weak_password" | "invalid_email" | "signup_disabled" | "unavailable" | "failed";

export function signupFailure(error: AuthFailure): SignupFailure {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || error.status === 429) return "rate_limit";
  if (code === "email_address_not_authorized" || code === "email_send_failed" || message.includes("sending confirmation email") || message.includes("email address not authorized")) return "email_delivery";
  if (code === "user_already_exists" || code === "email_exists") return "existing_account";
  if (code === "weak_password" || message.includes("password")) return "weak_password";
  if (code === "email_address_invalid" || message.includes("invalid email")) return "invalid_email";
  if (code === "signup_disabled") return "signup_disabled";
  if (code === "unexpected_failure" || error.status === 500 || error.status === 503) return "unavailable";
  return "failed";
}

export const signupMessages: Record<SignupFailure, string> = {
  rate_limit: "Too many verification emails were requested. Wait at least 60 seconds, then try again.",
  email_delivery: "The verification email could not be sent. The platform administrator must check the SMTP sender, credentials and delivery logs.",
  existing_account: "An account may already exist for this email. Sign in or request a secure sign in link instead.",
  weak_password: "Use a stronger password with at least 12 characters, including a mix of character types.",
  invalid_email: "Enter a valid email address that can receive the verification message.",
  signup_disabled: "New account registration is currently disabled by the authentication provider.",
  unavailable: "The authentication service is temporarily unavailable. Try again shortly.",
  failed: "Registration could not be completed. Try again, or sign in if this email already has an account."
};
