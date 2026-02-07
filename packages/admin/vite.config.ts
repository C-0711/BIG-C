import { defineConfig } from 'vite';

export default defineConfig({
  base: '/admin/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 7075,
    proxy: {
      '/api': 'http://localhost:7074',
      '/ws': {
        target: 'ws://localhost:7074',
        ws: true,
      },
    },
  },
});
