import { defineConfig } from "vite";

const backendPort = process.env.VITE_BACKEND_PORT || 3000;
const backendUrl = process.env.VITE_BACKEND_URL || `http://localhost:${backendPort}`;

export default defineConfig({
  root: "frontend",
  server: {
    proxy: {
      "/api": backendUrl,
      "/items": backendUrl,
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
