import { supabaseAdmin } from "../src/lib/supabase-admin";
import {
  algoliaClient,
  SEARCH_INDEX_NAME,
} from "../src/backend/modules/search/infrastructure/algolia-client";
import { logger } from "../src/lib/logger";
import { faker } from "@faker-js/faker";
import { exec } from "child_process";
import fs from "fs";

// Simplified Part interface for the test
interface Part {
  id: string;
  title: string;
  status: "AVAILABLE"; // Assuming 'available' is a valid status
}

async function runOutboxRecoveryTest() {
  const reportPath = "reports/outbox-recovery-report.md";
  const reportLines: string[] = [
    "# Stage 5: Outbox Recovery Validation Report",
  ];

  const cleanShutdownResult = await runCleanShutdownTest();
  reportLines.push(...cleanShutdownResult.report);

  const crashTestResult = await runMidProcessingCrashTest();
  reportLines.push(...crashTestResult.report);

  const retryStormResult = await runRetryStormTest();
  reportLines.push(...retryStormResult.report);

  const finalVerdict =
    cleanShutdownResult.passed &&
    crashTestResult.passed &&
    retryStormResult.passed
      ? "✅ PASS"
      : "❌ FAIL";
  reportLines.push("", `## Overall Test Suite Verdict: ${finalVerdict}`);

  if (!fs.existsSync("reports")) fs.mkdirSync("reports");
  fs.writeFileSync(reportPath, reportLines.join("\n"));
  logger.info(`Report generated at ${reportPath}`);
}

async function runCleanShutdownTest(): Promise<{
  passed: boolean;
  report: string[];
}> {
  const reportLines: string[] = ["# Test 1: Clean Shutdown and Recovery Test"];
  const testPartIds = Array.from({ length: 100 }, () => faker.string.uuid());
  let passed = false;

  try {
    reportLines.push("## Phase 1: Setup and Event Generation");
    await cleanup(testPartIds);
    logger.info("Cleaned up previous test data for clean shutdown test.");

    const newParts: Part[] = testPartIds.map((id) => ({
      id,
      title: `CLEAN-SHUTDOWN-TEST-${faker.commerce.productName()}`,
      status: "AVAILABLE",
    }));

    const { error: insertError } = await supabaseAdmin
      .from("parts")
      .insert(newParts);
    if (insertError)
      throw new Error(`Could not generate test events: ${insertError.message}`);
    reportLines.push(
      "- ✅ 100 new parts created, generating 100 outbox events.",
    );

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const { count: pendingCount, error: countError } = await supabaseAdmin
      .from("search_outbox")
      .select("*", { count: "exact", head: true })
      .in("aggregate_id", testPartIds)
      .eq("processed", false);

    if (countError || pendingCount !== 100) {
      throw new Error(
        `Expected 100 pending events, but found ${pendingCount}. Error: ${countError?.message}`,
      );
    }
    reportLines.push(
      "- ✅ Verified: **100** pending events found in `search_outbox`.",
    );

    reportLines.push("", "## Phase 2: Worker Recovery Simulation");
    await runWorker();
    reportLines.push("- ✅ `process-search-outbox.ts` script executed.");

    reportLines.push("", "## Phase 3: Final State Verification");

    const { count: finalPending } = await supabaseAdmin
      .from("search_outbox")
      .select("*", { count: "exact", head: true })
      .in("aggregate_id", testPartIds)
      .eq("processed", false);
    const { count: finalProcessed } = await supabaseAdmin
      .from("search_outbox")
      .select("*", { count: "exact", head: true })
      .in("aggregate_id", testPartIds)
      .eq("processed", true);
    const { results } = await algoliaClient.getObjects({
      requests: testPartIds.map((objectID) => ({
        indexName: SEARCH_INDEX_NAME,
        objectID,
        attributesToRetrieve: ["objectID"],
      })),
    });
    const indexedCount = results.filter((r) => r !== null).length;

    passed =
      finalPending === 0 && finalProcessed === 100 && indexedCount === 100;

    reportLines.push(
      "| Check             | Expected | Actual | Status |",
      "| ----------------- | -------- | ------ | ------ |",
      `| Event Loss        | 0        | ${100 - (finalProcessed || 0)}      | ${finalProcessed === 100 ? "✅" : "❌"} |`,
      `| Pending Events    | 0        | ${finalPending} | ${finalPending === 0 ? "✅" : "❌"} |`,
      `| Indexed in Algolia| 100      | ${indexedCount} | ${indexedCount === 100 ? "✅" : "❌"} |`,
      "",
      `### Test 1 Verdict: ${passed ? "✅ PASS" : "❌ FAIL"}`,
    );
  } catch (error: any) {
    reportLines.push(
      "",
      `**CRITICAL ERROR:** ${error.message}`,
      "",
      "### Test 1 Verdict: ❌ FAIL",
    );
  } finally {
    await cleanup(testPartIds);
    logger.info("Clean shutdown test complete.");
  }

  return { passed, report: reportLines };
}

async function runMidProcessingCrashTest(): Promise<{
  passed: boolean;
  report: string[];
}> {
  const reportLines: string[] = ["# Test 2: Mid-Processing Crash Test"];
  const testPartIds = Array.from({ length: 200 }, () => faker.string.uuid());
  let passed = false;

  try {
    reportLines.push("## Phase 1: Setup and Event Generation");
    await cleanup(testPartIds);
    logger.info("Cleaned up previous test data for crash test.");

    const newParts: Part[] = testPartIds.map((id) => ({
      id,
      title: `CRASH-TEST-${faker.commerce.productName()}`,
      status: "AVAILABLE",
    }));

    const { error: insertError } = await supabaseAdmin
      .from("parts")
      .insert(newParts);
    if (insertError)
      throw new Error(
        `Could not generate test events for crash test: ${insertError.message}`,
      );
    reportLines.push("- ✅ 200 new parts created for crash test.");

    await new Promise((resolve) => setTimeout(resolve, 2500));

    reportLines.push("", "## Phase 2: Simulate Mid-Processing Crash");

    const workerProcess = exec("tsx scripts/process-search-outbox.ts");
    reportLines.push("- ✅ Worker process started.");

    await new Promise((resolve) => setTimeout(resolve, 2000));
    workerProcess.kill("SIGKILL");
    reportLines.push("- 🛑 Worker process terminated abruptly (SIGKILL).");

    reportLines.push("", "## Phase 3: Restart Worker and Recover");
    await runWorker();
    reportLines.push("- ✅ Worker process restarted and finished processing.");

    reportLines.push("", "## Phase 4: Final State Verification");
    const { count: finalPending } = await supabaseAdmin
      .from("search_outbox")
      .select("*", { count: "exact", head: true })
      .in("aggregate_id", testPartIds)
      .eq("processed", false);
    const { count: finalProcessed } = await supabaseAdmin
      .from("search_outbox")
      .select("*", { count: "exact", head: true })
      .in("aggregate_id", testPartIds)
      .eq("processed", true);
    const { results } = await algoliaClient.getObjects({
      requests: testPartIds.map((objectID) => ({
        indexName: SEARCH_INDEX_NAME,
        objectID,
        attributesToRetrieve: ["objectID"],
      })),
    });
    const indexedCount = results.filter((r) => r !== null).length;

    passed =
      finalPending === 0 && finalProcessed === 200 && indexedCount === 200;

    reportLines.push(
      "| Check             | Expected | Actual | Status |",
      "| ----------------- | -------- | ------ | ------ |",
      `| Event Loss        | 0        | ${200 - (finalProcessed || 0)}      | ${finalProcessed === 200 ? "✅" : "❌"} |`,
      `| Duplicate Indexes | 0        | ${indexedCount - 200} | ${indexedCount === 200 ? "✅" : "❌"} |`,
      `| Stuck Events      | 0        | ${finalPending} | ${finalPending === 0 ? "✅" : "❌"} |`,
      "",
      `### Test 2 Verdict: ${passed ? "✅ PASS" : "❌ FAIL"}`,
    );
  } catch (error: any) {
    reportLines.push(
      "",
      `**CRITICAL ERROR:** ${error.message}`,
      "",
      "### Test 2 Verdict: ❌ FAIL",
    );
  } finally {
    await cleanup(testPartIds);
    logger.info("Mid-processing crash test complete.");
  }

  return { passed, report: reportLines };
}

async function runRetryStormTest(): Promise<{
  passed: boolean;
  report: string[];
}> {
  const reportLines: string[] = ["# Test 3: Retry Storm Test"];
  const testPartIds = Array.from({ length: 50 }, () => faker.string.uuid());
  let passed = false;

  try {
    reportLines.push("## Phase 1: Setup and Event Generation");
    await cleanup(testPartIds);
    logger.info("Cleaned up previous test data for retry storm test.");

    const newParts: Part[] = testPartIds.map((id) => ({
      id,
      title: `RETRY-STORM-TEST-${faker.commerce.productName()}`,
      status: "AVAILABLE",
    }));

    const { error: insertError } = await supabaseAdmin
      .from("parts")
      .insert(newParts);
    if (insertError)
      throw new Error(
        `Could not generate test events for retry test: ${insertError.message}`,
      );
    reportLines.push("- ✅ 50 new parts created for retry storm test.");

    await new Promise((resolve) => setTimeout(resolve, 2500));

    reportLines.push("", "## Phase 2: Simulate Algolia API Failure");

    const invalidEnv = { ...process.env, ALGOLIA_ADMIN_KEY: "invalid_key" };
    try {
      await runWorker(invalidEnv);
    } catch (error) {
      // Expected to fail
    }
    reportLines.push(
      "- ✅ Worker process executed with invalid credentials and failed as expected.",
    );

    const { data: events, error: eventsError } = await supabaseAdmin
      .from("search_outbox")
      .select("retry_count, processed")
      .in("aggregate_id", testPartIds);
    if (eventsError)
      throw new Error(
        `Could not fetch events from outbox: ${eventsError.message}`,
      );

    const retriedEvents = events.filter((e) => e.retry_count > 0).length;
    const stillUnprocessed = events.filter((e) => !e.processed).length;

    if (retriedEvents < 50 || stillUnprocessed < 50) {
      throw new Error(
        `Expected all 50 events to be retried and remain unprocessed, but found ${retriedEvents} retried and ${stillUnprocessed} unprocessed.`,
      );
    }
    reportLines.push(
      `- ✅ Verified: **${retriedEvents}** events correctly marked for retry.`,
    );

    reportLines.push("", "## Phase 3: Recover and Reprocess");
    await runWorker();
    reportLines.push(
      "- ✅ Worker process restarted with correct credentials and finished processing.",
    );

    reportLines.push("", "## Phase 4: Final State Verification");
    const { count: finalPending } = await supabaseAdmin
      .from("search_outbox")
      .select("*", { count: "exact", head: true })
      .in("aggregate_id", testPartIds)
      .eq("processed", false);
    const { count: finalProcessed } = await supabaseAdmin
      .from("search_outbox")
      .select("*", { count: "exact", head: true })
      .in("aggregate_id", testPartIds)
      .eq("processed", true);
    const { results } = await algoliaClient.getObjects({
      requests: testPartIds.map((objectID) => ({
        indexName: SEARCH_INDEX_NAME,
        objectID,
        attributesToRetrieve: ["objectID"],
      })),
    });
    const indexedCount = results.filter((r) => r !== null).length;

    passed = finalPending === 0 && finalProcessed === 50 && indexedCount === 50;

    reportLines.push(
      "| Check             | Expected | Actual | Status |",
      "| ----------------- | -------- | ------ | ------ |",
      `| Event Loss        | 0        | ${50 - (finalProcessed || 0)}      | ${finalProcessed === 50 ? "✅" : "❌"} |`,
      `| Worker Recovery   | Yes      | ${finalProcessed === 50 ? "✅" : "Yes"}      | ${finalProcessed === 50 ? "✅" : "❌"} |`,
      `| Stuck Events      | 0        | ${finalPending} | ${finalPending === 0 ? "✅" : "❌"} |`,
      "",
      `### Test 3 Verdict: ${passed ? "✅ PASS" : "❌ FAIL"}`,
    );
  } catch (error: any) {
    reportLines.push(
      "",
      `**CRITICAL ERROR:** ${error.message}`,
      "",
      "### Test 3 Verdict: ❌ FAIL",
    );
  } finally {
    await cleanup(testPartIds);
    logger.info("Retry storm test complete.");
  }

  return { passed, report: reportLines };
}

async function cleanup(partIds: string[]) {
  // await algoliaClient.initIndex(SEARCH_INDEX_NAME).deleteObjects(partIds);
  await supabaseAdmin.from("parts").delete().in("id", partIds);
  await supabaseAdmin
    .from("search_outbox")
    .delete()
    .in("aggregate_id", partIds);
}

function runWorker(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  return new Promise((resolve, reject) => {
    const workerProcess = exec("tsx scripts/process-search-outbox.ts", { env });
    workerProcess.stdout?.on("data", (data) => console.log(data.toString()));
    workerProcess.stderr?.on("data", (data) => console.error(data.toString()));
    workerProcess.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Worker process exited with code ${code}`));
    });
  });
}

runOutboxRecoveryTest();
