import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Production builds must not chat on the console; debug() in
      // src/logic/debug.ts is the dev-only escape hatch (#122).
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored third-party bundle: ~2,600 findings hide the real ones.
    "public/**",
  ]),
]);

export default eslintConfig;
