import { NextResponse } from "next/server";
import { runHealthChecks } from "@/lib/health-checks";

export async function GET() {
  const report = await runHealthChecks();
  const httpStatus = report.status === "ok" ? 200 : 503;

  const body: Record<string, unknown> = {
    status: report.status,
    version: report.version,
    environment: report.environment,
    message:
      report.status === "ok"
        ? "PartsPeddle Core API online (Next.js App Router)"
        : "One or more critical dependencies are unavailable",
    checks: report.checks,
  };

  if (report.build && Object.keys(report.build).length > 0) {
    body.build = report.build;
  }

  return NextResponse.json(body, { status: httpStatus });
}