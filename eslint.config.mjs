// @ts-check

import eslint from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

/** @type {any} */
const tsPlugin = tseslint;

export default defineConfig([
  eslint.configs.recommended,
  {
    languageOptions: {
      parser: tsparser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // ✅ Enables process, console, require, etc.
        ...globals.es2024,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  globalIgnores([
    "node_modules/*", // ignore dependencies
    "dist/*", // ignore build output
    "husky/*", // ignore git hooks
  ]),
]);
