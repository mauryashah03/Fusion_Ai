import { defineConfig } from "@tanstack/start/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  tsr: {
    autoCodeSplitting: true,
  },
  vite: {
    plugins: [tsconfigPaths()],
  },
});