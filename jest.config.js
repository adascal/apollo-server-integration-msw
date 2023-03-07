/**
 * @type {import('jest').Config}
 */
module.exports = {
  testMatch: ['**/src/__tests__/integration.test.ts'],
  testNamePattern: '^(?!.*passes apollo data to the gateway)(?!.*throws an error if POST JSON is malformed).*$',
  transform: {
    '^.+\\.(js|ts)$': [
      'babel-jest',
      {
        plugins: ['tsconfig-paths-module-resolver'],
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
      },
    ],
  },
};
