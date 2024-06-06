module.exports = {
  extends: 'next/core-web-vitals',
  plugins: ["@stylexjs"],
  rules: {
    'ft-flow/space-after-type-colon': 0,
    'ft-flow/no-types-missing-file-annotation': 0,
    'ft-flow/generic-spacing': 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-unused-vars": 0
  }
}