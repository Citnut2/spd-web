import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    port: 5174,
    open: false,
    host: true
  },
  publicDir: 'public'
});
