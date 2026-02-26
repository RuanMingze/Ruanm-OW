// ESLint configuration for Ruanm project
const typescriptParser = require('@typescript-eslint/parser');
const typescriptPlugin = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');

module.exports = [
  {
    ignores: [
      'out/**',
      'node_modules/**',
      'scripts/**',
      'postcss.config.mjs',
      'next.config.mjs',
      'eslint.config.cjs',
      '.next/**',
      'Desktop/**',
      'auto-fix-next-on-pages.js',
      'tailwind.config.ts',
      'next-env.d.ts'
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json'
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        process: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        fetch: 'readonly',
        navigator: 'readonly',
        React: 'readonly',
        NodeJS: 'readonly',
        LayoutProps: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      react: reactPlugin
    },
    rules: {
      // Basic ESLint rules
      'semi': 'off',
      'quotes': 'off',
      'no-undef': 'error',
      'no-unused-vars': 'off',
      
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off'
    }
  }
];
