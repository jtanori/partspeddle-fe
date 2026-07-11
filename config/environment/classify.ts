import { ENVIRONMENT_VARIABLES, EnvProvider, EnvScope, type EnvProvider as EnvProviderType, type EnvVarDefinition } from './schema';

/**
 * Classification helpers for environment variables.
 *
 * These functions are simple filters over the canonical schema. They are used
 * by validators, documentation generators, and secret audits.
 */

export function byScope(scope: EnvScope): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.scope === scope);
}

export function byScopes(scopes: readonly EnvScope[]): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => scopes.includes(v.scope));
}

export function byProvider(provider: EnvProviderType): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.provider === provider);
}

export function required(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.required);
}

export function optional(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => !v.required);
}

export function secrets(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.secret);
}

export function publicRuntime(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.scope === EnvScope.PUBLIC_RUNTIME);
}

export function serverRuntime(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.scope === EnvScope.SERVER_RUNTIME);
}

export function ciDeploy(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.scope === EnvScope.CI_DEPLOY);
}

export function smokeTest(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.scope === EnvScope.SMOKE_TEST);
}

export function development(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.scope === EnvScope.DEVELOPMENT);
}

export function flySecrets(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.provider === EnvProvider.FLY_SECRETS);
}

export function githubSecrets(): EnvVarDefinition[] {
  return ENVIRONMENT_VARIABLES.filter((v) => v.provider === EnvProvider.GITHUB_SECRETS);
}
