import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-console': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'uploads/'],
  }
);
