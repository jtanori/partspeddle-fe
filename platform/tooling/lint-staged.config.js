/** @type {import('lint-staged').Config} */
export default {
  '*.{ts,tsx}': ['eslint --cache --fix', 'prettier --cache --write'],
  '*.{json,md,css}': ['prettier --cache --write'],
};
