import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        diagnostics: false
      }
    ]
  },
  transformIgnorePatterns: ['/node_modules/'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: ['dist/', 'generated/'],
  moduleNameMapper: {
    '^@pgpmjs/env$': '<rootDir>/tests/__mocks__/@pgpmjs/env',
    '^@pgpmjs/logger$': '<rootDir>/tests/__mocks__/@pgpmjs/logger',
    '^@constructive-io/postmaster$':
      '<rootDir>/tests/__mocks__/@constructive-io/postmaster',
    '^simple-smtp-server$': '<rootDir>/tests/__mocks__/simple-smtp-server',
    '^@launchql/mjml$': '<rootDir>/tests/__mocks__/@launchql/mjml',
    '^graphql-tag$': '<rootDir>/tests/__mocks__/graphql-tag',
    '^graphql-request$': '<rootDir>/tests/__mocks__/graphql-request'
  },
  testTimeout: 30000
};

export default config;
