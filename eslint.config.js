// @ts-check
import eslint from '@eslint/js';
import { config, configs as tseslintConfigs } from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default config(
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslintConfigs.strictTypeChecked,
      ...tseslintConfigs.stylisticTypeChecked,
      stylistic.configs['recommended-flat']
    ],
    rules: {
      'object-shorthand': ['warn', 'always', { avoidExplicitReturnArrows: true }],
      'operator-assignment': 'warn',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@stylistic/comma-dangle': ['warn', 'only-multiline'],
      '@stylistic/semi': ['warn', 'always'],
      '@stylistic/arrow-parens': ['warn', 'as-needed'],
      '@stylistic/max-statements-per-line': ['warn', { max: 2 }],
      '@stylistic/member-delimiter-style': ['warn', { multiline: { delimiter: 'semi' } }]
    },
    ignores: ['dist/**']
  },
  {
    files: ['**/*.js', '**/*.test.ts'],
    ...tseslintConfigs.disableTypeChecked,
  },
);
