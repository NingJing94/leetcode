const { join } = require('path');

module.exports = {
  env: {
    es2020: true,
    jest: true,
    node: true,
  },
  extends: [
    'plugin:jest/recommended',
    'airbnb-base',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    'jest',
    'markdown',
  ],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    'jest/no-test-callback': 'off',
    'no-console': 'error',
    'no-constant-condition': ['error', { checkLoops: false }],
  },
  settings: {
    'import/extensions': ['.js', '.mjs'],
    'import/resolver': {
      alias: {
        extensions: ['.js', '.mjs', '.json'],
        map: [
          ['@', join(__dirname, 'src')],
        ],
      },
      node: {
        extensions: ['.js', '.mjs', '.json'],
      },
    },
  },
};
