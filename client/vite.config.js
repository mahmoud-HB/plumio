import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const target = process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target,
        changeOrigin: true
      },
      '/health': {
        target,
        changeOrigin: true
      }
    }
  }
});