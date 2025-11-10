import nextConfig from "@asksync/eslint-config/next.js";

export default [
  ...nextConfig,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      // Allow @/ alias imports
      "import/no-relative-parent-imports": "off",
      // Disable import/order to prevent conflicts with Prettier
      "import/order": "off",
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
    files: ["next-env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
];
