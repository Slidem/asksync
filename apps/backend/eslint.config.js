import baseConfig from "@asksync/eslint-config/base.js";

export default [
  ...baseConfig,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        node: true,
      },
    },
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
  {
    files: ["convex/**/*.ts"],
    rules: {
      // Allow relative imports for Convex generated files
      "import/no-relative-parent-imports": "off",
    },
  },
];
