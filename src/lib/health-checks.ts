import { validateRuntime } from "../../config/environment/validate";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  algoliaClient,
  SEARCH_INDEX_NAME,
} from "@/backend/modules/search/infrastructure/algolia-client";

export type DependencyStatus = "ok" | "error";

export interface DependencyCheckResult {
  status: DependencyStatus;
  latencyMs: number;
  message?: string;
}

export interface HealthCheckReport {
  status: "ok" | "degraded";
  version: string;
  environment: string;
  checks: {
    environment: DependencyCheckResult;
    supabase: DependencyCheckResult;
    algolia: DependencyCheckResult;
  };
  build?: {
    sha?: string;
    timestamp?: string;
    image?: string;
  };
}

function getAppVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION || process.env.npm_package_version || "0.0.0";
}

function getEnvironmentName(): string {
  return process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "unknown";
}

async function checkEnvironment(): Promise<DependencyCheckResult> {
  const startedAt = performance.now();

  try {
    const result = validateRuntime({ includeOptional: true, strict: true });
    if (result.success) {
      return {
        status: "ok",
        latencyMs: Math.round(performance.now() - startedAt),
      };
    }
    return {
      status: "error",
      latencyMs: Math.round(performance.now() - startedAt),
      message: result.errors.map((e) => `${e.name}: ${e.message}`).join("; "),
    };
  } catch (error) {
    return {
      status: "error",
      latencyMs: Math.round(performance.now() - startedAt),
      message: error instanceof Error ? error.message : "Environment validation failed",
    };
  }
}

async function checkSupabase(): Promise<DependencyCheckResult> {
  const startedAt = performance.now();

  try {
    const { error } = await supabaseAdmin
      .from("categories")
      .select("id", { head: true, count: "exact" });

    if (error) {
      return {
        status: "error",
        latencyMs: Math.round(performance.now() - startedAt),
        message: error.message,
      };
    }

    return {
      status: "ok",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      status: "error",
      latencyMs: Math.round(performance.now() - startedAt),
      message: error instanceof Error ? error.message : "Supabase check failed",
    };
  }
}

async function checkAlgolia(): Promise<DependencyCheckResult> {
  const startedAt = performance.now();

  try {
    await algoliaClient.getSettings({ indexName: SEARCH_INDEX_NAME });

    return {
      status: "ok",
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      status: "error",
      latencyMs: Math.round(performance.now() - startedAt),
      message: error instanceof Error ? error.message : "Algolia check failed",
    };
  }
}

export async function runHealthChecks(): Promise<HealthCheckReport> {
  const [environment, supabase, algolia] = await Promise.all([
    checkEnvironment(),
    checkSupabase(),
    checkAlgolia(),
  ]);

  const isHealthy =
    environment.status === "ok" && supabase.status === "ok" && algolia.status === "ok";

  const build: HealthCheckReport["build"] = {};
  if (process.env.NEXT_PUBLIC_BUILD_SHA) build.sha = process.env.NEXT_PUBLIC_BUILD_SHA;
  if (process.env.NEXT_PUBLIC_BUILD_TIMESTAMP) build.timestamp = process.env.NEXT_PUBLIC_BUILD_TIMESTAMP;
  if (process.env.NEXT_PUBLIC_BUILD_IMAGE) build.image = process.env.NEXT_PUBLIC_BUILD_IMAGE;

  // prettier-ignore
  return {
    status: isHealthy ? "ok" : "degraded",
    version: getAppVersion(),
    environment: getEnvironmentName(),
    checks: { environment, supabase, algolia },
    build: Object.keys(build).length > 0 ? build : undefined,
  };
}
