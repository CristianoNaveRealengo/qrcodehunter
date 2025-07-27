import path from 'path';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@qrcode-hunter/shared': path.resolve(__dirname, '../shared/src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    target: 'esnext'
  }
});