module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ['js', 'mjs', 'json'],
  moduleNameMapper: {
    '^@\\/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['jest-extended'],
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/?(*.)+(spec|test).js',
  ],
  verbose: true,
};
