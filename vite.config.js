import { defineConfig } from "vite";

const backendPort = process.env.VITE_BACKEND_PORT || 3000;

export default defineConfig({
  server: {
    proxy: {
      "/api": `http://localhost:${backendPort}`,
      "/items": `http://localhost:${backendPort}`,
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
