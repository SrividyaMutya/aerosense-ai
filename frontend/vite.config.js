import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'decimal.js-light': 'decimal.js-light/decimal.js',
    },
  },
  server: {
    port: 5188,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8008',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:8008',
        ws: true,
      },
    },
  },
});
