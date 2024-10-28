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
  ...compat.extends('plugin:cypress/recommended'),
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      globals: {
        cy: true,
        Cypress: true,
        before: true,
        after: true,
        beforeEach: true,
        afterEach: true,
      }
    }
  }
];
