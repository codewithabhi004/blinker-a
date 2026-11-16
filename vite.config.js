import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/blinker-a/" : "/",
  plugins: [react({ jsxRuntime: "automatic" })],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": "http://127.0.0.1:4000",
      "/socket.io": {
        target: "http://127.0.0.1:4000",
        ws: true
      }
    }
  }
});
