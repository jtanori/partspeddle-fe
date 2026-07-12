import {
  validateRuntime,
  validateCiDeploy,
  validateSmokeTest,
  validateAll,
  type EnvValidationResult,
} from '../../../config/environment/validate';

const mode = process.argv[2] ?? 'runtime';

let result: EnvValidationResult;

switch (mode) {
  case 'runtime':
    result = validateRuntime();
    break;
  case 'ci-deploy':
    result = validateCiDeploy();
    break;
  case 'smoke-test':
    result = validateSmokeTest();
    break;
  case 'all':
    result = validateAll();
    break;
  default:
    console.error(`Unknown validation mode: ${mode}`);
    console.error('Usage: pnpm env:validate [runtime|ci-deploy|smoke-test|all]');
    process.exit(2);
}

if (!result.success) {
  console.error(`Environment validation failed (${mode}):`);
  for (const error of result.errors) {
    console.error(`  - ${error.name}: ${error.message}`);
  }
  process.exit(1);
}

if (result.defaulted.length > 0) {
  console.warn(`Using default values for optional variables: ${result.defaulted.join(', ')}`);
}

console.log(`Environment validation passed (${mode}).`);
