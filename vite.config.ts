import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// Actions supplies the exact Pages base path, including custom domains.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_PATH || "/",
});
