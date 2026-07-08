// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

const tsRecommendedRules = ts.configs.recommended.rules;
const reactRecommendedRules = react.configs.recommended.rules;
const reactHooksRecommendedRules = reactHooks.configs.recommended.rules;

const sharedTsRules = {
  ...tsRecommendedRules,
  "no-undef": "off",
  "@typescript-eslint/no-explicit-any": "off",
  "@typescript-eslint/no-unused-vars": "warn",
};

const domainStrictRules = {
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
};

export default [js.configs.recommended, {
  ignores: ["node_modules/**", ".next/**", "dist/**"],
}, {
  files: ["src/**/*.{ts,tsx}"],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
  plugins: {
    "@typescript-eslint": ts,
    react,
    "react-hooks": reactHooks,
  },
  rules: {
    ...sharedTsRules,
    ...reactRecommendedRules,
    ...reactHooksRecommendedRules,
    "react/react-in-jsx-scope": "off",
  },
  settings: {
    react: { version: "detect" },
  },
}, {
  files: ["src/domain/**/*.{ts,tsx}"],
  rules: domainStrictRules,
}, {
  files: [
    "src/backend/modules/search/application/build-search-document.ts",
    "src/backend/modules/search/infrastructure/algolia-search-repository.ts",
  ],
  rules: domainStrictRules,
}, {
  files: ["scripts/**/*.{ts,tsx,js}", "tests/**/*.{ts,tsx}"],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    globals: {
      ...globals.node,
    },
  },
  plugins: {
    "@typescript-eslint": ts,
  },
  rules: {
    ...sharedTsRules,
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react-hooks/rules-of-hooks": "off",
    "react-hooks/set-state-in-effect": "off",
  },
}, ...storybook.configs["flat/recommended"]];