import { defineConfig } from "@playwright/test";
import { resolveE2EBaseUrl } from "./tests/e2e/env";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/smoke.spec.ts",
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: resolveE2EBaseUrl(),
    browserName: "chromium",
    trace: "on-first-retry",
  },
});
