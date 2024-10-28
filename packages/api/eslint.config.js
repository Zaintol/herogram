const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const path = require('path');
const baseConfig = require('../../eslint.config.js');

const compat = new FlatCompat({
  baseDirectory: path.resolve(__dirname),
  recommendedConfig: js.configs.recommended
});

module.exports = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  }
];
