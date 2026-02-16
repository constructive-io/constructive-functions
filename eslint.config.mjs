import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports
    },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'quote-props': ['error', 'as-needed'],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'simple-import-sort/imports': 1,
      'simple-import-sort/exports': 1,
      'unused-imports/no-unused-imports': 1,
      '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: 'React|res|next|^_' }],
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-var-requires': 0,
      'no-console': 0,
      '@typescript-eslint/ban-ts-comment': 0,
      'prefer-const': 0,
      'prefer-spread': 0,
      'no-case-declarations': 0,
      'no-implicit-globals': 0,
      '@typescript-eslint/no-unsafe-declaration-merging': 0
    }
  },
  prettierConfig
];
