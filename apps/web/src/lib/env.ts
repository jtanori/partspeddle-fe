import { z } from 'zod';
import { ENVIRONMENT_VARIABLES, EnvScope } from '@config/environment/schema';

/**
 * Runtime environment validator.
 *
 * This module re-exports typed server/public objects derived from the
 * canonical schema in `@config/environment/schema.ts`. It preserves the
 * original behavior:
 *
 * - In production, missing/invalid variables throw.
 * - In development, they warn and return empty objects.
 */

const serverEntries = ENVIRONMENT_VARIABLES.filter((v) => v.scope === EnvScope.SERVER_RUNTIME);
const publicEntries = ENVIRONMENT_VARIABLES.filter((v) => v.scope === EnvScope.PUBLIC_RUNTIME);

function buildShape(entries: typeof ENVIRONMENT_VARIABLES) {
  const shape: Record<string, z.ZodType<unknown>> = {};
  for (const def of entries) {
    shape[def.name] = def.required ? def.schema : def.schema.optional().default(def.defaultValue);
  }
  return shape;
}

const serverSchema = z.object(buildShape(serverEntries));
const publicSchema = z.object(buildShape(publicEntries));

export function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';

  const serverResult = serverSchema.safeParse(process.env);
  const publicResult = publicSchema.safeParse(process.env);

  if (!serverResult.success) {
    const message = `Invalid server environment variables: ${JSON.stringify(serverResult.error.format())}`;
    if (isProduction) {
      throw new Error(message);
    }
    console.warn(message);
  }

  if (!publicResult.success) {
    const message = `Invalid public environment variables: ${JSON.stringify(publicResult.error.format())}`;
    if (isProduction) {
      throw new Error(message);
    }
    console.warn(message);
  }

  return {
    server: serverResult.success ? serverResult.data : ({} as z.infer<typeof serverSchema>),
    public: publicResult.success ? publicResult.data : ({} as z.infer<typeof publicSchema>),
  };
}

export const env = validateEnv();
