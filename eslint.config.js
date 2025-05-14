import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import typescript from "typescript-eslint";
import reactCompiler from "eslint-plugin-react-compiler";

export default typescript.config(
  {
    ignores: ["dist", "convex/_generated"],
  },
  {
    extends: [
      js.configs.recommended,
      typescript.configs.strictTypeChecked,
      typescript.configs.stylisticTypeChecked,
      reactHooks.configs.recommended,
      reactRefresh.configs.vite,
      reactCompiler.configs.recommended,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { projectService: true, project: import.meta.dirname },
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
);
