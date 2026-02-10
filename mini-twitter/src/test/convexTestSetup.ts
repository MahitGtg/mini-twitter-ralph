/// <reference types="vite/client" />

export const modules = import.meta.glob([
  "../../convex/**/*.ts",
  "../../convex/_generated/**/*.ts",
]);
