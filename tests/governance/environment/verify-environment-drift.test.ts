import { describe, it, expect } from 'vitest';
import {
  parseArgs,
  expectedFlySecretNames,
  expectedGithubSecretNames,
  computeDrift,
  runDriftCheck,
  FLY_APPS,
  type Environment,
} from '../../../platform/scripts/deployment/verify-environment-drift';

const expectedFlySecrets = [
  'APP_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ALGOLIA_APP_ID',
  'ALGOLIA_ADMIN_KEY',
  'ALGOLIA_SEARCH_INDEX_NAME',
  'ALGOLIA_INDEX_PRICE_ASC',
  'ALGOLIA_INDEX_PRICE_DESC',
  'ALGOLIA_INDEX_NEWEST',
  'GEMINI_API_KEY',
  'SUPABASE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const expectedGithubStagingSecrets = [
  'FLY_API_TOKEN',
  'SUPABASE_ACCESS_TOKEN',
  'STAGING_SUPABASE_PROJECT_ID',
  'STAGING_URL',
  'STAGING_SUPABASE_URL',
  'STAGING_SUPABASE_ANON_KEY',
  'STAGING_SUPABASE_SERVICE_ROLE_KEY',
];

const expectedGithubProductionSecrets = [
  'FLY_API_TOKEN',
  'SUPABASE_ACCESS_TOKEN',
  'PRODUCTION_SUPABASE_PROJECT_ID',
];

describe('DC-7.1 verify-environment-drift', () => {
  describe('parseArgs', () => {
    it('parses staging environment', () => {
      expect(parseArgs(['node', 'script.ts', '--env', 'staging'])).toEqual({
        environment: 'staging',
      });
    });

    it('parses production environment', () => {
      expect(parseArgs(['node', 'script.ts', '--env', 'production'])).toEqual({
        environment: 'production',
      });
    });

    it('exits with usage error when --env is missing', () => {
      const originalExit = process.exit;
      let exitCode: number | undefined;
      process.exit = ((code?: number) => {
        exitCode = code;
      }) as typeof process.exit;

      parseArgs(['node', 'script.ts']);
      expect(exitCode).toBe(2);

      process.exit = originalExit;
    });

    it('exits with usage error for unknown environment', () => {
      const originalExit = process.exit;
      let exitCode: number | undefined;
      process.exit = ((code?: number) => {
        exitCode = code;
      }) as typeof process.exit;

      parseArgs(['node', 'script.ts', '--env', 'preview']);
      expect(exitCode).toBe(2);

      process.exit = originalExit;
    });
  });

  describe('expectedFlySecretNames', () => {
    it('returns all Fly runtime secrets from the schema', () => {
      expect(expectedFlySecretNames()).toEqual(expectedFlySecrets);
    });
  });

  describe('expectedGithubSecretNames', () => {
    it('returns CI-deploy and smoke-test secrets for staging', () => {
      expect(expectedGithubSecretNames('staging')).toEqual(expectedGithubStagingSecrets);
    });

    it('returns only CI-deploy secrets for production', () => {
      expect(expectedGithubSecretNames('production')).toEqual(expectedGithubProductionSecrets);
    });

    it('does not include production project ID in staging', () => {
      expect(expectedGithubSecretNames('staging')).not.toContain('PRODUCTION_SUPABASE_PROJECT_ID');
    });

    it('does not include staging project ID in production', () => {
      expect(expectedGithubSecretNames('production')).not.toContain('STAGING_SUPABASE_PROJECT_ID');
    });
  });

  describe('computeDrift', () => {
    it('returns empty drift when sets match', () => {
      const result = computeDrift(['A', 'B'], ['A', 'B']);
      expect(result).toEqual({ missing: [], orphans: [] });
    });

    it('detects missing secrets', () => {
      const result = computeDrift(['A', 'B', 'C'], ['A', 'B']);
      expect(result.missing).toEqual(['C']);
      expect(result.orphans).toEqual([]);
    });

    it('detects orphaned secrets', () => {
      const result = computeDrift(['A', 'B'], ['A', 'B', 'C']);
      expect(result.missing).toEqual([]);
      expect(result.orphans).toEqual(['C']);
    });

    it('detects both missing and orphaned secrets', () => {
      const result = computeDrift(['A', 'B', 'C'], ['A', 'B', 'D']);
      expect(result.missing).toEqual(['C']);
      expect(result.orphans).toEqual(['D']);
    });
  });

  describe('runDriftCheck', () => {
    function makeListers(
      fly: string[],
      github: string[],
    ): [(app: string) => string[], (env: Environment) => string[]] {
      return [
        (app: string) => {
          expect(app).toBe(FLY_APPS.staging);
          return fly;
        },
        (env: Environment) => {
          expect(env).toBe('staging');
          return github;
        },
      ];
    }

    it('passes when Fly and GitHub secrets match the schema for staging', () => {
      const summary = runDriftCheck(
        'staging',
        ...makeListers(expectedFlySecrets, expectedGithubStagingSecrets),
      );

      expect(summary.fly.missing).toEqual([]);
      expect(summary.fly.orphans).toEqual([]);
      expect(summary.github.missing).toEqual([]);
      expect(summary.github.orphans).toEqual([]);
    });

    it('passes when Fly and GitHub secrets match the schema for production', () => {
      const summary = runDriftCheck(
        'production',
        (app: string) => {
          expect(app).toBe(FLY_APPS.production);
          return expectedFlySecrets;
        },
        (env: Environment) => {
          expect(env).toBe('production');
          return expectedGithubProductionSecrets;
        },
      );

      expect(summary.fly.missing).toEqual([]);
      expect(summary.fly.orphans).toEqual([]);
      expect(summary.github.missing).toEqual([]);
      expect(summary.github.orphans).toEqual([]);
    });

    it('reports missing Fly secrets', () => {
      const missing = expectedFlySecrets.filter((name) => name !== 'GEMINI_API_KEY');
      const summary = runDriftCheck(
        'staging',
        ...makeListers(missing, expectedGithubStagingSecrets),
      );

      expect(summary.fly.missing).toContain('GEMINI_API_KEY');
      expect(summary.fly.orphans).toEqual([]);
      expect(summary.github.missing).toEqual([]);
    });

    it('reports orphaned Fly secrets not in schema', () => {
      const actual = [...expectedFlySecrets, 'LEGACY_SECRET'];
      const summary = runDriftCheck(
        'staging',
        ...makeListers(actual, expectedGithubStagingSecrets),
      );

      expect(summary.fly.missing).toEqual([]);
      expect(summary.fly.orphans).toContain('LEGACY_SECRET');
      expect(summary.github.missing).toEqual([]);
    });

    it('reports missing GitHub smoke-test secrets only for staging', () => {
      const githubSecrets = expectedGithubProductionSecrets; // no smoke-test vars
      const summary = runDriftCheck(
        'staging',
        ...makeListers(expectedFlySecrets, githubSecrets),
      );

      expect(summary.github.missing).toContain('STAGING_URL');
      expect(summary.github.missing).toContain('STAGING_SUPABASE_URL');
      expect(summary.github.missing).toContain('STAGING_SUPABASE_ANON_KEY');
      expect(summary.github.missing).toContain('STAGING_SUPABASE_SERVICE_ROLE_KEY');
    });

    it('does not require smoke-test secrets for production', () => {
      const summary = runDriftCheck(
        'production',
        (app: string) => {
          expect(app).toBe(FLY_APPS.production);
          return expectedFlySecrets;
        },
        (env: Environment) => {
          expect(env).toBe('production');
          return expectedGithubProductionSecrets;
        },
      );

      expect(summary.github.missing).toEqual([]);
      expect(summary.github.missing).not.toContain('STAGING_URL');
    });
  });
});
