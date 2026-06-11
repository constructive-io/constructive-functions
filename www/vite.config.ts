import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@fbp/types': path.resolve(__dirname, '../packages/fbp-types/src'),
      '@fbp/spec': path.resolve(__dirname, '../packages/fbp-spec/src'),
      '@fbp/evaluator': path.resolve(__dirname, '../packages/fbp-evaluator/src'),
      '@fbp/graph-editor': path.resolve(__dirname, '../packages/fbp-graph-editor/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3456',
      '/ws': {
        target: 'ws://localhost:3456',
        ws: true,
      },
      '/graphql/compute': {
        target: 'http://127.0.0.1:6464',
        changeOrigin: true,
        rewrite: (p) => p.replace('/graphql/compute', '/graphql'),
        headers: { Host: 'compute.localhost:6464' },
      },
      '/graphql/api': {
        target: 'http://127.0.0.1:6464',
        changeOrigin: true,
        rewrite: (p) => p.replace('/graphql/api', '/graphql'),
        headers: { Host: 'api.localhost:6464' },
      },
      '/graphql/objects': {
        target: 'http://127.0.0.1:6464',
        changeOrigin: true,
        rewrite: (p) => p.replace('/graphql/objects', '/graphql'),
        headers: { Host: 'objects.localhost:6464' },
      },
    },
  },
});
