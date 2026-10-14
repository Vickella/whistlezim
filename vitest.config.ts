import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["tests/unit/**/*.test.ts"], coverage: { provider: "v8", reporter: ["text", "json-summary"], include: ["lib/config.ts", "lib/domain/**/*.ts", "lib/security/**/*.ts", "lib/tenancy/**/*.ts", "lib/validation/**/*.ts"], thresholds: { lines: 85, functions: 85, statements: 85, branches: 80 } } },
  resolve: { alias: { "@": new URL(".", import.meta.url).pathname } }
});
