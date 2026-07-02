import { NextResponse } from "next/server";
import { runHealthChecks } from "@/lib/health-checks";

export async function GET() {
  const report = await runHealthChecks();
  const httpStatus = report.status === "ok" ? 200 : 503;

  return NextResponse.json(
    {
      status: report.status,
      message:
        report.status === "ok"
          ? "PartsPeddle Core API online (Next.js App Router)"
          : "One or more critical dependencies are unavailable",
      checks: report.checks,
    },
    { status: httpStatus },
  );
}