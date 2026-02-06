// Dev server script dat esbuild-wasm gebruikt in plaats van esbuild native binary.
// Dit omzeilt de EPERM-restricties op bedrijfslaptops.
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Patch esbuild naar esbuild-wasm
const Module = await import("module");
const originalResolve = Module.default._resolveFilename;
Module.default._resolveFilename = function (request, parent, isMain, options) {
  if (request === "esbuild") {
    return originalResolve.call(
      this,
      "esbuild-wasm",
      parent,
      isMain,
      options,
    );
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

// Start Vite met plugins
const { createServer } = await import("vite");
const tailwindcss = (await import("@tailwindcss/vite")).default;
const react = (await import("@vitejs/plugin-react-swc")).default;

const server = await createServer({
  configFile: false,
  root: ".",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
});

await server.listen();
server.printUrls();
