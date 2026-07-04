export const STAGING_URL = "https://stage.partspeddle.com";
export const PRODUCTION_URL = "https://partspeddle.com";
export const LOCAL_URL = "http://localhost:3000";

export function resolveE2EBaseUrl(): string {
  return (
    process.env.E2E_BASE_URL ??
    process.env.PLAYWRIGHT_BASE_URL ??
    LOCAL_URL
  );
}
