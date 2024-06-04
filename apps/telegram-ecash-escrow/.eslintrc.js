module.exports = {
  extends: 'next/core-web-vitals',
  plugins: ["@stylexjs"],
  rules: {
    "@stylexjs/valid-styles": "error",
    'ft-flow/space-after-type-colon': 0,
    'ft-flow/no-types-missing-file-annotation': 0,
    'ft-flow/generic-spacing': 0,
    "@stylexjs/valid-styles": "error"
  }
}