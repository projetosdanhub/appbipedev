import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  root: new URL("./demo", import.meta.url).pathname,
  plugins: [react()],
  server: { host: "127.0.0.1", port: 3110, strictPort: true },
  build: { outDir: "../dist/demo", emptyOutDir: true },
});
