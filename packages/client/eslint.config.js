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
  ...compat.extends(
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ),
  {
    files: ['**/*.tsx', '**/*.jsx'],
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
