import { z } from 'zod';
import {
  ENVIRONMENT_VARIABLES,
  EnvScope,
  type EnvScope as EnvScopeType,
  type EnvVarDefinition,
} from './schema';

export interface EnvValidationError {
  name: string;
  message: string;
}

export interface EnvValidationResult {
  success: boolean;
  errors: EnvValidationError[];
  /** Variables that used a default value because they were missing/empty. */
  defaulted: string[];
}

export interface ValidateOptions {
  /** Include optional variables (and apply their defaults) in validation. */
  includeOptional?: boolean;
  /** Treat missing/empty optional variables without a default as an error. */
  strict?: boolean;
}

function buildRecord(
  scopes: readonly EnvScopeType[],
  includeOptional: boolean,
): Record<string, unknown> {
  const record: Record<string, unknown> = {};

  for (const def of ENVIRONMENT_VARIABLES) {
    if (!scopes.includes(def.scope)) continue;
    if (!def.required && !includeOptional) continue;

    const raw = process.env[def.name];
    if (raw === undefined || raw === '') {
      record[def.name] = def.required ? undefined : def.defaultValue;
    } else {
      record[def.name] = raw;
    }
  }

  return record;
}

function buildShape(
  scopes: readonly EnvScopeType[],
  includeOptional: boolean,
  strict: boolean,
): Record<string, z.ZodType<unknown>> {
  const shape: Record<string, z.ZodType<unknown>> = {};

  for (const def of ENVIRONMENT_VARIABLES) {
    if (!scopes.includes(def.scope)) continue;
    if (!def.required && !includeOptional) continue;

    if (def.required) {
      shape[def.name] = def.schema;
    } else if (strict) {
      // In strict mode optional vars must either be present or have a default.
      shape[def.name] =
        def.defaultValue !== undefined
          ? def.schema.default(def.defaultValue)
          : def.schema.optional();
    } else {
      shape[def.name] = def.schema.optional();
    }
  }

  return shape;
}

function collectErrors(
  def: EnvVarDefinition,
  formatted: z.ZodFormattedError<unknown>,
): EnvValidationError | undefined {
  const issues = formatted._errors;
  if (issues && issues.length > 0) {
    return { name: def.name, message: issues.join('; ') };
  }
  return undefined;
}

export function validateScopes(
  scopes: readonly EnvScopeType[],
  options: ValidateOptions = {},
): EnvValidationResult {
  const { includeOptional = true, strict = true } = options;

  const record = buildRecord(scopes, includeOptional);
  const shape = buildShape(scopes, includeOptional, strict);
  const schema = z.object(shape);
  const result = schema.safeParse(record);

  const defaulted: string[] = [];
  for (const def of ENVIRONMENT_VARIABLES) {
    if (!scopes.includes(def.scope)) continue;
    if (!def.required && !includeOptional) continue;
    const raw = process.env[def.name];
    if ((raw === undefined || raw === '') && def.defaultValue !== undefined) {
      defaulted.push(def.name);
    }
  }

  if (result.success) {
    return { success: true, errors: [], defaulted };
  }

  const errors: EnvValidationError[] = [];
  const formatted = result.error.format();

  for (const def of ENVIRONMENT_VARIABLES) {
    if (!scopes.includes(def.scope)) continue;
    if (!def.required && !includeOptional) continue;
    const issue = collectErrors(def, formatted[def.name] as z.ZodFormattedError<unknown>);
    if (issue) errors.push(issue);
  }

  return { success: false, errors, defaulted };
}

export function validateRuntime(options?: ValidateOptions): EnvValidationResult {
  return validateScopes([EnvScope.SERVER_RUNTIME, EnvScope.PUBLIC_RUNTIME], options);
}

export function validateCiDeploy(options?: ValidateOptions): EnvValidationResult {
  return validateScopes([EnvScope.CI_DEPLOY], options);
}

export function validateSmokeTest(options?: ValidateOptions): EnvValidationResult {
  return validateScopes([EnvScope.SMOKE_TEST], options);
}

export function validateDevelopment(options?: ValidateOptions): EnvValidationResult {
  return validateScopes([EnvScope.DEVELOPMENT], options);
}

export function validateAll(options?: ValidateOptions): EnvValidationResult {
  return validateScopes(Object.values(EnvScope), options);
}

/**
 * Throw-friendly wrapper used at application startup.
 *
 * In production a validation failure throws immediately. In development it
 * logs a warning so local development without every secret is still possible.
 */
export function assertRuntimeValid(result: EnvValidationResult): void {
  if (result.success) return;

  const message = `Invalid environment variables: ${JSON.stringify(result.errors)}`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(message);
  }
  console.warn(message);
}
