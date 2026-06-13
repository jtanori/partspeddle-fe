export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startPerformanceMonitoring } = await import('./src/lib/performance-monitor');
    const { startObservability } = await import('./src/lib/observability');
    await startPerformanceMonitoring();
    await startObservability();
  }
}
