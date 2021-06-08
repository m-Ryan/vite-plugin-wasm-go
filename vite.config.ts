import { defineConfig } from 'vite';
import wasmGo from './src/index';
export default defineConfig({
  resolve: {
    alias: {},
  },
  define: {},
  build: {
    target: 'es2015',
  },
  optimizeDeps: {
    include: [],
  },

  plugins: [wasmGo({})],
});
