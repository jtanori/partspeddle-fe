
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { DiagConsoleLogger, DiagLogLevel, diag, metrics, trace } from '@opentelemetry/api';

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const prometheusExporter = new PrometheusExporter();

const sdk = new NodeSDK({
  metricReader: prometheusExporter,
  instrumentations: [getNodeAutoInstrumentations({
    // Enable/disable specific instrumentations here
    '@opentelemetry/instrumentation-fs': {
        enabled: false,
    }
  })],
});

sdk.start();

console.log('OpenTelemetry SDK started. Prometheus metrics available at http://localhost:9464/metrics');

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.error('Error terminating tracing', error))
    .finally(() => process.exit(0));
});


// --- Metrics Definitions ---
const meter = metrics.getMeter('vintrade-search-platform');

export const searchRequestsTotal = meter.createCounter('search_requests_total', {
    description: 'Total number of search requests.',
});

export const searchSuccessTotal = meter.createCounter('search_success_total', {
    description: 'Total number of successful search requests.',
});

export const searchFailuresTotal = meter.createCounter('search_failures_total', {
    description: 'Total number of failed search requests.',
});

export const searchLatencyMs = meter.createHistogram('search_latency_ms', {
    description: 'Search API request latency in milliseconds.',
    unit: 'ms',
});

export const indexUpdatesTotal = meter.createCounter('index_updates_total', {
    description: 'Total number of documents sent for indexing.',
});

export const indexFailuresTotal = meter.createCounter('index_failures_total', {
    description: 'Total number of documents that failed to index.',
});

export const workerRetriesTotal = meter.createCounter('worker_retries_total', {
    description: 'Total number of retries performed by the index worker.',
});

export const outboxPendingEvents = meter.createObservableGauge('outbox_pending_events', {
    description: 'Number of pending events in the search outbox.',
});

// --- Tracing Definitions ---
export const tracer = trace.getTracer('vintrade-search-platform-tracer');
