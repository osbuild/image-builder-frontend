import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReactRedux from 'eslint-plugin-react-redux';
import pluginImport from 'eslint-plugin-import';
import fecConfig from '@redhat-cloud-services/eslint-config-redhat-cloud-services';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import disableAutofix from 'eslint-plugin-disable-autofix';
import pluginPrettier from 'eslint-plugin-prettier';
import jestDom from 'eslint-plugin-jest-dom';
import pluginTestingLibrary from 'eslint-plugin-testing-library';
import pluginPlaywright from 'eslint-plugin-playwright';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  { // Ignore programatically generated files
    ignores: [
      '**/mockServiceWorker.js',
      '**/imageBuilderApi.ts',
      '**/contentSourcesApi.ts',
      '**/rhsmApi.ts',
      '**/provisioningApi.ts',
      '**/complianceApi.ts',
      '**/composerCloudApi.ts'
    ]
  },

  { // Base config for js/ts files
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.vitest.json', './playwright/tsconfig.json']
      },
      globals: {
        ...globals.browser,
        // node
        'JSX': 'readonly',
        'process': 'readonly',
        '__dirname': 'readonly',
        'require': 'readonly',
        // vitest
        'describe': 'readonly',
        'it': 'readonly',
        'test': 'readonly',
        'expect': 'readonly',
        'vi': 'readonly',
        'beforeAll': 'readonly',
        'beforeEach': 'readonly',
        'afterAll': 'readonly',
        'afterEach': 'readonly'
      },
    },
    plugins: {
      js,
      '@typescript-eslint': tseslint.plugin,
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'react-redux': pluginReactRedux,
      import: pluginImport,
      jsxA11y: pluginJsxA11y,
      'disable-autofix': disableAutofix,
      prettier: pluginPrettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginReactRedux.configs.recommended.rules,
      ...fecConfig.rules,
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'sibling', 'parent', 'index'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        },
        'newlines-between': 'always',
        pathGroups: [ // ensures the import of React is always on top
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['react']
      }],
      'sort-imports': ['error', {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      }],
      'no-duplicate-imports': 'error',
      'prefer-const': ['error', {
        destructuring: 'any',
      }],
      'no-console': 'error',
      'eqeqeq': 'error',
      'array-callback-return': 'warn',
      '@typescript-eslint/ban-ts-comment': ['error', {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': 'allow-with-description',
        'ts-nocheck': true,
        'ts-check': true,
        minimumDescriptionLength: 5,
      }],
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      'disable-autofix/@typescript-eslint/no-unnecessary-condition': 'warn',
      'no-unused-vars': 'off', // disable js rule in favor of @typescript-eslint's rule
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'jsx-a11y/no-autofocus': 'off',
      'prettier/prettier': ['error', {
        semi: true,
        tabWidth: 2,
        singleQuote: true,
        jsxSingleQuote: true,
        bracketSpacing: true,
        tsxSingleQuote: true,
        tsSingleQuote: true,
        printWidth: 80,
        trailingComma: 'all',
      }],
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },

  { // Override for test files
    files: ['src/test/**/*.{ts,tsx}'],
    plugins: {
      'jest-dom': jestDom,
      'testing-library': pluginTestingLibrary,
    },
    rules: {
      ...jestDom.configs.recommended.rules,
      ...pluginTestingLibrary.configs.react.rules,
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'testing-library/no-debugging-utils': 'error'
    },
  },

  { // Override for Playwright tests
    files: ['playwright/**/*.ts'],
    plugins: {
      playwright: pluginPlaywright,
    },
    rules: {
      ...pluginPlaywright.configs.recommended.rules,
      'playwright/no-conditional-in-test': 'off',
      'playwright/no-conditional-expect': 'off',
      'playwright/no-skipped-test': [
        'error',
        {
          'allowConditional': true
        }
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },

  {
    files: [
      'playwright/BootTests/helpers/OpenStackWrapper.ts',
      'playwright/BootTests/helpers/imageBuilding.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
]);
