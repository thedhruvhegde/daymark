import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/api/export/**/*.tsx"],
    rules: { "jsx-a11y/alt-text": "off" },
  },
  globalIgnores([".next/**", "node_modules/**"]),
]);
