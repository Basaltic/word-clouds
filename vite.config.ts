import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],

  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "word-clouds",
    },
    rollupOptions: {
      plugins: [],
    },
  },
});
