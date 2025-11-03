import { defineConfig } from "vite";
import offlineFirst from "../../packages/vite-plugin-offline-first/dist/index.js";

export default defineConfig({
  plugins: [
    offlineFirst({
      cacheName: "offline-first-demo",
      precacheAssets: ["/index.html"],
      enableUpdateCheck: true,
    }),
  ],
});
