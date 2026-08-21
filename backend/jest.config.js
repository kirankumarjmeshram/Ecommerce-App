export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  clearMocks: true,
  testTimeout: 120000,
  collectCoverageFrom: ['controllers/**/*.js', 'middleware/**/*.js', 'utils/**/*.js'],
};
