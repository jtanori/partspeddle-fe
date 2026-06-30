import { supabaseAdmin } from "../src/lib/supabase-admin";
import {
  algoliaClient,
  SEARCH_INDEX_NAME,
} from "../src/backend/modules/search/infrastructure/algolia-client";
import { logger } from "../src/lib/logger";
import { faker } from "@faker-js/faker";
import fs from "fs";
import { exec } from "child_process";

// Simplified Part interface for the test
interface Part {
  id: string;
  title: string;
  status: "AVAILABLE";
}

async function runDriftValidationTest() {
  const reportPath = "reports/drift-validation-report.md";
  const reportLines: string[] = [
    "# Stage 5: Search Drift Validation Report",
    "",
  ];

  // Scenario A
  const scenarioAResult = await runScenarioA();
  reportLines.push(...scenarioAResult.report);

  const scenarioBResult = await runScenarioB();
  reportLines.push(...scenarioBResult.report);

  const scenarioCResult = await runScenarioC();
  reportLines.push(...scenarioCResult.report);

  const scenarioDResult = await runScenarioD();
  reportLines.push(...scenarioDResult.report);

  const largeDatasetResult = await runLargeDatasetValidation();
  reportLines.push(...largeDatasetResult.report);

  const finalVerdict =
    scenarioAResult.passed &&
    scenarioBResult.passed &&
    scenarioCResult.passed &&
    scenarioDResult.passed &&
    largeDatasetResult.passed
      ? "✅ PASS"
      : "❌ FAIL";
  reportLines.push("", `## Overall Test Suite Verdict: ${finalVerdict}`);

  if (!fs.existsSync("reports")) fs.mkdirSync("reports");
  fs.writeFileSync(reportPath, reportLines.join("\n"));
  logger.info(`Report generated at ${reportPath}`);
}

async function runScenarioA(): Promise<{ passed: boolean; report: string[] }> {
  const reportLines: string[] = [
    "# Test 1: Create 100 vehicles and expect 0 drift",
  ];
  const testPartIds = Array.from({ length: 100 }, () => faker.string.uuid());
  let passed = false;

  try {
    reportLines.push("## Phase 1: Setup and Event Generation");
    await cleanup(testPartIds);
    logger.info("Cleaned up previous test data for scenario A.");

    const newParts: Part[] = testPartIds.map((id) => ({
      id,
      title: `DRIFT-TEST-A-${faker.commerce.productName()}`,
      status: "AVAILABLE",
    }));

    const { error: insertError } = await supabaseAdmin
      .from("parts")
      .insert(newParts);
    if (insertError)
      throw new Error(`Could not generate test events: ${insertError.message}`);
    reportLines.push("- ✅ 100 new parts created.");

    await runWorker();
    reportLines.push("- ✅ Worker executed to sync data.");

    reportLines.push("", "## Phase 2: Audit and Verification");
    const auditResult = await audit();

    passed =
      auditResult.missingFromIndex.length === 0 &&
      auditResult.staleInIndex.length === 0 &&
      auditResult.attributeMismatches.length === 0;

    reportLines.push(
      "| Check               | Expected | Actual | Status |",
      "| ------------------- | -------- | ------ | ------ |",
      `| Missing from Index  | 0        | ${auditResult.missingFromIndex.length}      | ${auditResult.missingFromIndex.length === 0 ? "✅" : "❌"} |`,
      `| Stale in Index      | 0        | ${auditResult.staleInIndex.length}      | ${auditResult.staleInIndex.length === 0 ? "✅" : "❌"} |`,
      `| Attribute Mismatches | 0        | ${auditResult.attributeMismatches.length}      | ${auditResult.attributeMismatches.length === 0 ? "✅" : "❌"} |`,
      `| Drift Percentage    | 0%       | ${auditResult.driftPercent}%    | ${auditResult.driftPercent === 0 ? "✅" : "❌"} |`,
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
    logger.info("Scenario A test complete.");
  }

  return { passed, report: reportLines };
}

async function runScenarioB(): Promise<{ passed: boolean; report: string[] }> {
  const reportLines: string[] = [
    "# Test 2: Update 20 vehicles and expect 0 drift",
  ];
  const testPartIds = Array.from({ length: 100 }, () => faker.string.uuid());
  let passed = false;

  try {
    reportLines.push("## Phase 1: Setup and Event Generation");
    await cleanup(testPartIds);
    const newParts: Part[] = testPartIds.map((id) => ({
      id,
      title: `DRIFT-TEST-B-OLD-${faker.commerce.productName()}`,
      status: "AVAILABLE",
    }));
    await supabaseAdmin.from("parts").insert(newParts);
    await runWorker();
    reportLines.push("- ✅ 100 new parts created and synced.");

    reportLines.push("", "## Phase 2: Update 20 parts");
    const partsToUpdate = testPartIds.slice(0, 20);
    const updates = partsToUpdate.map((id) => ({
      id,
      title: `DRIFT-TEST-B-NEW-${faker.commerce.productName()}`,
    }));
    const { error: updateError } = await supabaseAdmin
      .from("parts")
      .upsert(updates);
    if (updateError)
      throw new Error(`Could not update parts: ${updateError.message}`);
    reportLines.push("- ✅ 20 parts updated in Supabase.");

    await runWorker();
    reportLines.push("- ✅ Worker executed to sync updates.");

    reportLines.push("", "## Phase 3: Audit and Verification");
    const auditResult = await audit();

    passed =
      auditResult.missingFromIndex.length === 0 &&
      auditResult.staleInIndex.length === 0 &&
      auditResult.attributeMismatches.length === 0;

    reportLines.push(
      "| Check               | Expected | Actual | Status |",
      "| ------------------- | -------- | ------ | ------ |",
      `| Missing from Index  | 0        | ${auditResult.missingFromIndex.length}      | ${auditResult.missingFromIndex.length === 0 ? "✅" : "❌"} |`,
      `| Stale in Index      | 0        | ${auditResult.staleInIndex.length}      | ${auditResult.staleInIndex.length === 0 ? "✅" : "❌"} |`,
      `| Attribute Mismatches | 0        | ${auditResult.attributeMismatches.length}      | ${auditResult.attributeMismatches.length === 0 ? "✅" : "❌"} |`,
      `| Drift Percentage    | 0%       | ${auditResult.driftPercent}%    | ${auditResult.driftPercent === 0 ? "✅" : "❌"} |`,
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
    logger.info("Scenario B test complete.");
  }

  return { passed, report: reportLines };
}

async function runScenarioC(): Promise<{ passed: boolean; report: string[] }> {
  const reportLines: string[] = [
    "# Test 3: Delete 10 vehicles and expect 0 drift",
  ];
  const testPartIds = Array.from({ length: 100 }, () => faker.string.uuid());
  let passed = false;

  try {
    reportLines.push("## Phase 1: Setup and Event Generation");
    await cleanup(testPartIds);
    const newParts: Part[] = testPartIds.map((id) => ({
      id,
      title: `DRIFT-TEST-C-${faker.commerce.productName()}`,
      status: "AVAILABLE",
    }));
    await supabaseAdmin.from("parts").insert(newParts);
    await runWorker();
    reportLines.push("- ✅ 100 new parts created and synced.");

    reportLines.push("", "## Phase 2: Delete 10 parts");
    const partsToDelete = testPartIds.slice(0, 10);
    const { error: deleteError } = await supabaseAdmin
      .from("parts")
      .delete()
      .in("id", partsToDelete);
    if (deleteError)
      throw new Error(`Could not delete parts: ${deleteError.message}`);
    reportLines.push("- ✅ 10 parts deleted from Supabase.");

    await runWorker();
    reportLines.push("- ✅ Worker executed to sync deletions.");

    reportLines.push("", "## Phase 3: Audit and Verification");
    const auditResult = await audit();

    passed =
      auditResult.missingFromIndex.length === 0 &&
      auditResult.staleInIndex.length === 0 &&
      auditResult.attributeMismatches.length === 0;

    reportLines.push(
      "| Check               | Expected | Actual | Status |",
      "| ------------------- | -------- | ------ | ------ |",
      `| Missing from Index  | 0        | ${auditResult.missingFromIndex.length}      | ${auditResult.missingFromIndex.length === 0 ? "✅" : "❌"} |`,
      `| Stale in Index      | 0        | ${auditResult.staleInIndex.length}      | ${auditResult.staleInIndex.length === 0 ? "✅" : "❌"} |`,
      `| Attribute Mismatches | 0        | ${auditResult.attributeMismatches.length}      | ${auditResult.attributeMismatches.length === 0 ? "✅" : "❌"} |`,
      `| Drift Percentage    | 0%       | ${auditResult.driftPercent}%    | ${auditResult.driftPercent === 0 ? "✅" : "❌"} |`,
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
    logger.info("Scenario C test complete.");
  }

  return { passed, report: reportLines };
}

async function runScenarioD(): Promise<{ passed: boolean; report: string[] }> {
  const reportLines: string[] = [
    "# Test 4: Manually delete 20 Algolia records and expect drift detection",
  ];
  const testPartIds = Array.from({ length: 100 }, () => faker.string.uuid());
  let passed = false;

  try {
    reportLines.push("## Phase 1: Setup and Event Generation");
    await cleanup(testPartIds);
    const newParts: Part[] = testPartIds.map((id) => ({
      id,
      title: `DRIFT-TEST-D-${faker.commerce.productName()}`,
      status: "AVAILABLE",
    }));
    await supabaseAdmin.from("parts").insert(newParts);
    await runWorker();
    reportLines.push("- ✅ 100 new parts created and synced.");

    reportLines.push("", "## Phase 2: Manually delete 20 records from Algolia");
    const partsToDelete = testPartIds.slice(0, 20);
    await algoliaClient.deleteObjects({
      indexName: SEARCH_INDEX_NAME,
      objectIDs: partsToDelete,
    });
    reportLines.push("- ✅ 20 records manually deleted from Algolia.");

    reportLines.push("", "## Phase 3: Audit and Verification");
    const auditResult = await audit();

    passed =
      auditResult.missingFromIndex === 20 && auditResult.staleInIndex === 0;

    reportLines.push(
      "| Check               | Expected | Actual | Status |",
      "| ------------------- | -------- | ------ | ------ |",
      `| Missing from Index  | 20       | ${auditResult.missingFromIndex}      | ${auditResult.missingFromIndex === 20 ? "✅" : "❌"} |`,
      `| Stale in Index      | 0        | ${auditResult.staleInIndex}      | ${auditResult.staleInIndex === 0 ? "✅" : "❌"} |`,
      "",
      `### Test 4 Verdict: ${passed ? "✅ PASS" : "❌ FAIL"}`,
    );
  } catch (error: any) {
    reportLines.push(
      "",
      `**CRITICAL ERROR:** ${error.message}`,
      "",
      "### Test 4 Verdict: ❌ FAIL",
    );
  } finally {
    await cleanup(testPartIds);
    logger.info("Scenario D test complete.");
  }

  return { passed, report: reportLines };
}

async function runLargeDatasetValidation(): Promise<{
  passed: boolean;
  report: string[];
}> {
  const reportLines: string[] = [
    "# Test 5: Large Dataset Validation (1000 vehicles)",
  ];
  const testPartIds = Array.from({ length: 1000 }, () => faker.string.uuid());
  let passed = false;
  const startTime = Date.now();

  try {
    reportLines.push("## Phase 1: Setup and Event Generation");
    await cleanup(testPartIds);
    const newParts: Part[] = testPartIds.map((id) => ({
      id,
      title: `DRIFT-TEST-LARGE-${faker.commerce.productName()}`,
      status: "AVAILABLE",
    }));
    await supabaseAdmin.from("parts").insert(newParts);
    await runWorker();
    reportLines.push("- ✅ 1000 new parts created and synced.");

    reportLines.push("", "## Phase 2: Audit and Verification");
    const auditResult = await audit();
    const duration = Date.now() - startTime;

    passed =
      auditResult.missingFromIndex === 0 && auditResult.staleInIndex === 0;

    reportLines.push(
      "| Check               | Expected | Actual | Status |",
      "| ------------------- | -------- | ------ | ------ |",
      `| Missing from Index  | 0        | ${auditResult.missingFromIndex}      | ${auditResult.missingFromIndex === 0 ? "✅" : "❌"} |`,
      `| Stale in Index      | 0        | ${auditResult.staleInIndex}      | ${auditResult.staleInIndex === 0 ? "✅" : "❌"} |`,
      `| Audit Duration      | < 10 min | ${Math.round(duration / 1000)}s    | ${duration < 600000 ? "✅" : "❌"} |`,
      "",
      `### Test 5 Verdict: ${passed ? "✅ PASS" : "❌ FAIL"}`,
    );
  } catch (error: any) {
    reportLines.push(
      "",
      `**CRITICAL ERROR:** ${error.message}`,
      "",
      "### Test 5 Verdict: ❌ FAIL",
    );
  } finally {
    await cleanup(testPartIds);
    logger.info("Large Dataset test complete.");
  }

  return { passed, report: reportLines };
}

async function cleanup(partIds: string[]) {
  await algoliaClient.deleteObjects({
    indexName: SEARCH_INDEX_NAME,
    objectIDs: partIds,
  });
  await supabaseAdmin.from("parts").delete().in("id", partIds);
  await supabaseAdmin
    .from("search_outbox")
    .delete()
    .in("aggregate_id", partIds);
}

function runWorker(): Promise<void> {
  return new Promise((resolve, reject) => {
    const workerProcess = exec("tsx scripts/process-search-outbox.ts");
    workerProcess.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Worker process exited with code ${code}`));
    });
  });
}

function audit(): Promise<any> {
  return new Promise((resolve, reject) => {
    const auditProcess = exec("tsx scripts/audit-search-consistency.ts");
    let output = "";
    auditProcess.stdout?.on("data", (data) => {
      output += data.toString();
    });
    auditProcess.on("close", (code) => {
      if (code === 0) {
        // The audit script outputs the result as a JSON string to stdout
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch {
          reject(new Error("Failed to parse audit result"));
        }
      } else reject(new Error(`Audit process exited with code ${code}`));
    });
  });
}

runDriftValidationTest();
