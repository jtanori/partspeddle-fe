import { z } from 'zod';

/**
 * Environment variable scopes.
 *
 * Every variable is classified by where it is consumed. This is the single
 * source of truth for ownership, validation, and documentation generation.
 */
export const EnvScope = {
  /** Next.js server / API routes / server components. */
  SERVER_RUNTIME: 'server-runtime',
  /** Next.js client / browser (must be prefixed with NEXT_PUBLIC_). */
  PUBLIC_RUNTIME: 'public-runtime',
  /** GitHub Actions, Fly.io deploy, Supabase CLI. Not available at runtime. */
  CI_DEPLOY: 'ci-deploy',
  /** Smoke tests / operational validation against staging or production. */
  SMOKE_TEST: 'smoke-test',
  /** Local development / test utilities only. */
  DEVELOPMENT: 'development',
} as const;

export type EnvScope = (typeof EnvScope)[keyof typeof EnvScope];

export interface EnvVarDefinition {
  name: string;
  description: string;
  /** Where the variable is consumed. */
  scope: EnvScope;
  /** Whether the value must be treated as a secret. */
  secret: boolean;
  /** Whether the variable must be present for the scope to be valid. */
  required: boolean;
  /** Zod schema used to validate the raw string value. */
  schema: z.ZodType<unknown>;
  /** Default used when the variable is optional and missing/empty. */
  defaultValue?: unknown;
}

/**
 * Canonical environment variable definitions for PartsPeddle / VinTrack.
 *
 * This array is the single source of truth. All validation, classification,
 * and documentation is derived from it.
 */
export const ENVIRONMENT_VARIABLES: readonly EnvVarDefinition[] = [
  // -------------------------------------------------------------------------
  // Server runtime
  // -------------------------------------------------------------------------
  {
    name: 'APP_URL',
    description: 'Canonical application URL used by server-side code and metadata.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: false,
    required: true,
    schema: z.string().url(),
  },
  {
    name: 'SUPABASE_URL',
    description: 'Supabase project URL used by server-side code.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: false,
    required: true,
    schema: z.string().url(),
  },
  {
    name: 'SUPABASE_ANON_KEY',
    description: 'Supabase anon key used by server-side code.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: true,
    required: true,
    schema: z.string().min(1),
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service-role key used by server-side code (privileged).',
    scope: EnvScope.SERVER_RUNTIME,
    secret: true,
    required: true,
    schema: z.string().min(1),
  },
  {
    name: 'ALGOLIA_APP_ID',
    description: 'Algolia application ID used for server-side admin operations.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: false,
    required: true,
    schema: z.string().min(1),
  },
  {
    name: 'ALGOLIA_ADMIN_KEY',
    description: 'Algolia admin API key used by server-side code.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: true,
    required: true,
    schema: z.string().min(1),
  },
  {
    name: 'ALGOLIA_SEARCH_INDEX_NAME',
    description: 'Primary Algolia search index name.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: false,
    required: false,
    schema: z.string().min(1),
    defaultValue: 'parts',
  },
  {
    name: 'ALGOLIA_INDEX_PRICE_ASC',
    description: 'Algolia index used for price ascending sort.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: false,
    required: false,
    schema: z.string().min(1),
  },
  {
    name: 'ALGOLIA_INDEX_PRICE_DESC',
    description: 'Algolia index used for price descending sort.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: false,
    required: false,
    schema: z.string().min(1),
  },
  {
    name: 'ALGOLIA_INDEX_NEWEST',
    description: 'Algolia index used for newest-first sort.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: false,
    required: false,
    schema: z.string().min(1),
  },
  {
    name: 'GEMINI_API_KEY',
    description: 'Google Gemini API key used by server-side AI features.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: true,
    required: true,
    schema: z.string().min(1),
  },
  {
    name: 'SUPABASE_WEBHOOK_SECRET',
    description: 'Shared secret for validating Supabase webhooks in Edge Functions.',
    scope: EnvScope.SERVER_RUNTIME,
    secret: true,
    required: false,
    schema: z.string().min(1),
  },

  // -------------------------------------------------------------------------
  // Public / browser runtime
  // -------------------------------------------------------------------------
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL exposed to the browser.',
    scope: EnvScope.PUBLIC_RUNTIME,
    secret: false,
    required: true,
    schema: z.string().url(),
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anon key exposed to the browser.',
    scope: EnvScope.PUBLIC_RUNTIME,
    secret: true,
    required: true,
    schema: z.string().min(1),
  },

  // -------------------------------------------------------------------------
  // CI / deploy
  // -------------------------------------------------------------------------
  {
    name: 'FLY_API_TOKEN',
    description: 'Fly.io API token used by GitHub Actions to deploy applications.',
    scope: EnvScope.CI_DEPLOY,
    secret: true,
    required: true,
    schema: z.string().min(1),
  },
  {
    name: 'SUPABASE_ACCESS_TOKEN',
    description: 'Supabase personal access token used by GitHub Actions and the CLI.',
    scope: EnvScope.CI_DEPLOY,
    secret: true,
    required: true,
    schema: z.string().min(1),
  },
  {
    name: 'STAGING_SUPABASE_PROJECT_ID',
    description: 'Staging Supabase project reference ID.',
    scope: EnvScope.CI_DEPLOY,
    secret: false,
    required: true,
    schema: z.string().min(1),
  },
  {
    name: 'PRODUCTION_SUPABASE_PROJECT_ID',
    description: 'Production Supabase project reference ID.',
    scope: EnvScope.CI_DEPLOY,
    secret: false,
    required: true,
    schema: z.string().min(1),
  },

  // -------------------------------------------------------------------------
  // Smoke tests
  // -------------------------------------------------------------------------
  {
    name: 'STAGING_URL',
    description: 'Staging application URL used by smoke tests.',
    scope: EnvScope.SMOKE_TEST,
    secret: false,
    required: true,
    schema: z.string().url(),
  },
  {
    name: 'STAGING_SUPABASE_URL',
    description: 'Staging Supabase URL used by smoke tests.',
    scope: EnvScope.SMOKE_TEST,
    secret: false,
    required: true,
    schema: z.string().url(),
  },
  {
    name: 'STAGING_SUPABASE_ANON_KEY',
    description: 'Staging Supabase anon key used by smoke tests.',
    scope: EnvScope.SMOKE_TEST,
    secret: true,
    required: true,
    schema: z.string().min(1),
  },
  {
    name: 'STAGING_SUPABASE_SERVICE_ROLE_KEY',
    description: 'Staging Supabase service-role key used by smoke tests.',
    scope: EnvScope.SMOKE_TEST,
    secret: true,
    required: true,
    schema: z.string().min(1),
  },

  // -------------------------------------------------------------------------
  // Development / local
  // -------------------------------------------------------------------------
  {
    name: 'E2E_BASE_URL',
    description: 'Base URL for local Playwright end-to-end tests.',
    scope: EnvScope.DEVELOPMENT,
    secret: false,
    required: false,
    schema: z.string().url(),
  },
  {
    name: 'TRACE_ID',
    description: 'Optional trace identifier for SCGS replay validation.',
    scope: EnvScope.DEVELOPMENT,
    secret: false,
    required: false,
    schema: z.string().min(1),
  },
] as const;

export type EnvVarName = (typeof ENVIRONMENT_VARIABLES)[number]['name'];

export const ENVIRONMENT_VARIABLE_NAMES: readonly string[] = ENVIRONMENT_VARIABLES.map(
  (v) => v.name,
);

export function getVarDefinition(name: string): EnvVarDefinition | undefined {
  return ENVIRONMENT_VARIABLES.find((v) => v.name === name);
}
