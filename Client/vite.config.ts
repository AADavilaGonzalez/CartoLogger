import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL("./src", import.meta.url))
    }
  }
});
