import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.probe/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      // 类型检查交给 tsc，no-undef 在 TS 上只会误报
      'no-undef': 'off',
    },
  },
  {
    files: ['src/engine/**/*.ts', 'src/content/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: '引擎必须使用具名 RNG 流（rng: RngBag），禁止 Math.random',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['react', 'react-dom', 'zustand'],
        },
      ],
    },
  },
);
