import js from "@eslint/js";

const sharedRules = {
  // The quality gate: a missing semicolon fails the build.
  semi: ["error", "always"],
  eqeqeq: ["error", "always"],
  "no-var": "error",
  "prefer-const": "error",
  quotes: ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }]
};

export default [
  js.configs.recommended,
  {
    // Browser code
    files: ["js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        console: "readonly",
        IntersectionObserver: "readonly",
        module: "writable" // quality.js also exports itself for Jest
      }
    },
    rules: sharedRules
  },
  {
    // Jest tests
    files: ["tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        __dirname: "readonly",
        document: "readonly",
        DOMParser: "readonly",
        describe: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly"
      }
    },
    rules: sharedRules
  }
];
