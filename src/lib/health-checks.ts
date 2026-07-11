import { validateRuntime } from '../../config/environment/validate';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  algoliaClient,
  SEARCH_INDEX_NAME,
} from '@/backend/modules/search/infrastructure/algolia-client';

export type DependencyStatus = 'ok' | 'error';

export interface DependencyCheckResult {
  status: DependencyStatus;
  latencyMs: number;
  message?: string;
}

export interface HealthCheckReport {
  status: 'ok' | 'degraded';
  checks: {
    environment: DependencyCheckResult;
    supabase: DependencyCheckResult;
    algolia: DependencyCheckResult;
  };
}

async function checkEnvironment(): Promise<DependencyCheckResult> {
  const startedAt = performance.now();

  try {
    const result = validateRuntime({ includeOptional: true, strict: true });
    if (result.success) {
      return {
        status: 'ok',
        latencyMs: Math.round(performance.now() - startedAt),
      };
    }
    return {
      status: 'error',
      latencyMs: Math.round(performance.now() - startedAt),
      message: result.errors.map((e) => `${e.name}: ${e.message}`).join('; '),
    };
  } catch (error) {
    return {
      status: 'error',
      latencyMs: Math.round(performance.now() - startedAt),
      message: error instanceof Error ? error.message : 'Environment validation failed',
    };
  }
}

async function checkSupabase(): Promise<DependencyCheckResult> {
  const startedAt = performance.now();

  try {
    const { error } = await supabaseAdmin
      .from('categories')
      .select('id', { head: true, count: 'exact' });

    if (error) {
      return {
        status: 'error',
        latencyMs: Math.round(performance.now() - startedAt),
        message: error.message,
      };
    }

    return {
      status: 'ok',
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      status: 'error',
      latencyMs: Math.round(performance.now() - startedAt),
      message: error instanceof Error ? error.message : 'Supabase check failed',
    };
  }
}

async function checkAlgolia(): Promise<DependencyCheckResult> {
  const startedAt = performance.now();

  try {
    await algoliaClient.getSettings({ indexName: SEARCH_INDEX_NAME });

    return {
      status: 'ok',
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch (error) {
    return {
      status: 'error',
      latencyMs: Math.round(performance.now() - startedAt),
      message: error instanceof Error ? error.message : 'Algolia check failed',
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
    environment.status === 'ok' && supabase.status === 'ok' && algolia.status === 'ok';

  return {
    status: isHealthy ? 'ok' : 'degraded',
    checks: { environment, supabase, algolia },
  };
}
