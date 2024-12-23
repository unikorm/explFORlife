import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
        controller: '/src/remote_controller/remote_controller.html'
      }
    }
  }
});