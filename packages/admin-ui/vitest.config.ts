import path from 'path';
import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    transformMode: {
      web: [/\.[jt]sx?$/]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@qrcode-hunter/shared': path.resolve(__dirname, '../shared/src')
    },
    conditions: ['development', 'browser']
  }
});