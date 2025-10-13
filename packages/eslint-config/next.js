import baseConfig from "./base.js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  ...baseConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        React: "readonly",
        JSX: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      // React specific rules
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",

      // React Hooks rules (enforce rules of hooks)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Enforce absolute imports over relative imports (enhanced for Next.js)
      "import/no-relative-packages": "error",
      "import/no-relative-parent-imports": "error",

      // JSX a11y rules
      ...jsxA11y.configs.recommended.rules,
    },
  },
];