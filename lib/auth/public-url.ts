export function publicAppUrl(configuredUrl?: string, productionHost?: string) {
  const candidates = [configuredUrl, productionHost ? (productionHost.startsWith("http") ? productionHost : `https://${productionHost}`) : undefined];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) return url.origin;
    } catch {
      continue;
    }
  }
  return undefined;
}

export function signupCallbackUrl(requestUrl: string, configuredUrl?: string, productionHost?: string) {
  const origin = publicAppUrl(configuredUrl, productionHost) ?? new URL(requestUrl).origin;
  return new URL("/auth/callback?next=/dashboard/mfa", origin).toString();
}
