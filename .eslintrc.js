module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: "airbnb-base",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-console": 1,
    "class-methods-use-this": 0,
    "comma-dangle": 0,
    "max-len": 0,
    "object-curly-newline": 0,
    "consistent-return": 0,
    "prefer-const": 0,
    quotes: ["error", "double"],
    semi: ["error", "never"],
  },
}
