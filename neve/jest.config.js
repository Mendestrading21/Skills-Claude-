/** Jest config: pure domain/data/store logic tested via the expo preset. */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  collectCoverageFrom: ['src/domain/**/*.ts', 'src/data/**/*.ts', 'src/store/**/*.ts'],
};
