import { monitorEventLoopDelay } from "node:perf_hooks";

export async function startPerformanceMonitoring() {
  const h = monitorEventLoopDelay({ resolution: 20 });
  h.enable();

  setInterval(() => {
    const mean = h.mean / 1_000_000;
    const p99 = h.percentile(99) / 1_000_000;

    if (mean > 50 || p99 > 50) {
      console.warn(
        `[PERF WARNING] High event loop delay: Mean: ${Math.round(mean)}ms, P99: ${Math.round(p99)}ms`,
      );
    }
    h.reset();
  }, 5000);
}
