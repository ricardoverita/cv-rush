import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// SWC compiles decorators with metadata, which NestJS dependency injection needs in tests.
export const swcPlugin = swc.vite({
  jsc: {
    parser: { syntax: 'typescript', decorators: true },
    transform: { legacyDecorator: true, decoratorMetadata: true },
    target: 'es2023',
  },
  module: { type: 'es6' },
});

export default defineConfig({
  plugins: [swcPlugin],
  test: {
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['**/*.int.test.ts', '**/node_modules/**', '**/dist/**'],
  },
});
