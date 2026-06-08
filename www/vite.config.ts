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
    },
  },
});
