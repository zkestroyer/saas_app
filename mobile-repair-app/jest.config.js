/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    /* Mock the Supabase client for tests */
    '^../src/services/supabase$': '<rootDir>/tests/__mocks__/supabase.ts',
    '^../../src/services/supabase$': '<rootDir>/tests/__mocks__/supabase.ts',
  },
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/services/**/*.ts',
    '!src/services/supabase.ts',
  ],
};
