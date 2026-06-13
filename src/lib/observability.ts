import {
  DiagConsoleLogger,
  DiagLogLevel,
  diag,
  metrics,
  trace,
} from "@opentelemetry/api";

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

export async function startObservability() {
  try {
    const { NodeSDK } = await import("@opentelemetry/sdk-node");
    const { PrometheusExporter } =
      await import("@opentelemetry/exporter-prometheus");

    // Use a port that is less likely to cause issues or check if we should even start
    const prometheusExporter = new PrometheusExporter(
      {
        port: 9464,
      },
      () => {
        // Quietly ignore connection errors for the exporter itself
      },
    );

    const sdk = new NodeSDK({
      metricReader: prometheusExporter,
      instrumentations: [],
    });

    sdk.start();
    // logger.info('OpenTelemetry SDK started');
  } catch (error) {
    // Fail silently if observability can't start
  }
}

// --- Metrics Definitions ---
const meter = metrics.getMeter("vintrade-search-platform");
// ... rest of file
export const searchRequestsTotal = meter.createCounter(
  "search_requests_total",
  {
    description: "Total number of search requests.",
  },
);

export const searchSuccessTotal = meter.createCounter("search_success_total", {
  description: "Total number of successful search requests.",
});

export const searchFailuresTotal = meter.createCounter(
  "search_failures_total",
  {
    description: "Total number of failed search requests.",
  },
);

export const searchLatencyMs = meter.createHistogram("search_latency_ms", {
  description: "Search API request latency in milliseconds.",
  unit: "ms",
});

export const indexUpdatesTotal = meter.createCounter("index_updates_total", {
  description: "Total number of documents sent for indexing.",
});

export const indexFailuresTotal = meter.createCounter("index_failures_total", {
  description: "Total number of documents that failed to index.",
});

export const workerRetriesTotal = meter.createCounter("worker_retries_total", {
  description: "Total number of retries performed by the index worker.",
});

export const outboxPendingEvents = meter.createObservableGauge(
  "outbox_pending_events",
  {
    description: "Number of pending events in the search outbox.",
  },
);

// --- Tracing Definitions ---
export const tracer = trace.getTracer("vintrade-search-platform-tracer");
