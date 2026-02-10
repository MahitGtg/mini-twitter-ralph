import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environmentMatchGlobs: [
      ["convex/**", "edge-runtime"],
      ["**", "jsdom"],
    ],
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "convex/_generated/",
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
    server: {
      deps: {
        inline: ["convex-test"],
      },
    },
  },
  resolve: {
    alias: [
      { find: "@/convex", replacement: path.resolve(__dirname, "./convex") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
});
