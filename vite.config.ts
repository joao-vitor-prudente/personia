import tailwindcss from "@tailwindcss/vite";
import TanStackRouterVite from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import ReactCompilerConfig from "babel-plugin-react-compiler";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ autoCodeSplitting: true, target: "react" }),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
