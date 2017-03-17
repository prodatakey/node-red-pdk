module.exports = {
  extends: 'eslint:recommended',

  rules: {
    'no-console': 0,
  },

  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },

  env: {
    browser: true,
    jquery: true,
    es6: true,
  },

  globals: {
    RED: true,
  },
};

