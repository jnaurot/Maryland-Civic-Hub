import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "api-server",
          include: ["artifacts/api-server/**/*.test.{ts,tsx}"],
          environment: "node",
        },
      },
      {
        root: path.resolve(__dirname, "artifacts/rep"),
        plugins: [react()],
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "artifacts/rep/src"),
            "@assets": path.resolve(__dirname, "attached_assets"),
          },
          dedupe: ["react", "react-dom"],
        },
        test: {
          name: "rep",
          include: ["**/*.test.{ts,tsx}"],
          environment: "jsdom",
          globals: true,
          setupFiles: [
            path.resolve(__dirname, "artifacts/rep/src/test/setup.ts"),
          ],
        },
      },
    ],
  },
});
