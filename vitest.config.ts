import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/engine/**'],
      thresholds: { lines: 90, functions: 90, branches: 85 },
    },
    projects: [
      {
        test: {
          name: 'engine',
          environment: 'node',
          include: ['tests/engine/**/*.test.ts', 'tests/content/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'ui',
          environment: 'jsdom',
          include: ['tests/integration/**/*.test.tsx'],
        },
      },
    ],
  },
});
