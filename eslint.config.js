import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'docs/reference', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      /**
       * The React Compiler rule set, switched off deliberately.
       *
       * These rules assume components are pure and that nothing is mutated
       * outside of React's own update cycle. This site is built on the exact
       * opposite premise: one shared requestAnimationFrame writes transforms,
       * shader uniforms and DOM styles directly, every frame, because routing
       * sixty updates a second through React state is the single most
       * expensive thing the page could do.
       *
       * `rules-of-hooks` and `exhaustive-deps` stay on as errors — those catch
       * real bugs. The five below only flag the architecture.
       */
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/use-memo': 'off',

      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // The render loop and the CDP harness both need `any` in a few narrow
      // places where the upstream types are wrong or absent; those are opted
      // into explicitly rather than blanket-allowed.
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  // Prettier last: it turns off every stylistic rule that would fight the
  // formatter, so the two never disagree about the same line.
  prettier,
);
