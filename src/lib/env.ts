import { z } from 'zod';

const serverSchema = z.object({
  SUPABASE_URL: z.string().url().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ALGOLIA_APP_ID: z.string().min(1),
  ALGOLIA_ADMIN_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  ALGOLIA_SEARCH_INDEX_NAME: z.string().optional().default('parts'),
});

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

function validateEnv() {
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
