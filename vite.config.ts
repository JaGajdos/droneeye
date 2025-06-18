import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [],
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
  server: {
    proxy: {},
  },
  esbuild: {
    target: 'es2022',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
      supported: {
        'top-level-await': true,
      },
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Customize your chunking strategy here
          if (id.includes('node_modules')) {
            // Put all dependencies in a 'vendor' chunk
            return 'vendor';
          }
        },
      },
    },
  },
});
