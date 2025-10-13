import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: true,
      },
      globals: {
        React: "readonly",
        JSX: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      // Enforce absolute imports over relative imports
      "import/no-relative-packages": "error",
      "import/no-relative-parent-imports": "error",
      // Allow relative imports only within the same directory
      "import/no-useless-path-segments": ["error", { noUselessIndex: true }],
      // Prefer absolute imports - disabled newlines-between to avoid Prettier conflicts
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      // Add Prettier as an ESLint rule
      "prettier/prettier": "error",
    },
  },
  prettier, // This disables ESLint rules that conflict with Prettier
  {
    ignores: [".*.js", "node_modules/", "dist/", ".next/", "out/", "**/convex/_generated/**"],
  },
];