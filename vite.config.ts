import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({
    // Habilitar future flags de React
    babel: {
      parserOpts: {
        plugins: ['v7_startTransition', 'v7_relativeSplatPath']
      }
    }
  })],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});