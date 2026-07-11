import { validateRuntime } from '../../config/environment/validate';

function checkEnv(): boolean {
  const result = validateRuntime({ includeOptional: true, strict: true });

  if (!result.success) {
    for (const error of result.errors) {
      console.error(`Missing or invalid environment variable: ${error.name} — ${error.message}`);
    }
    return false;
  }

  if (result.defaulted.length > 0) {
    console.warn(`Using default values for optional variables: ${result.defaulted.join(', ')}`);
  }

  return true;
}

if (!checkEnv()) {
  process.exit(1);
}
console.log('Environment check passed.');
