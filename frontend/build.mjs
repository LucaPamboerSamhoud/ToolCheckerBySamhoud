// Build script dat esbuild-wasm gebruikt in plaats van esbuild native binary.
// Dit omzeilt de EPERM-restricties op bedrijfslaptops.
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Patch esbuild naar esbuild-wasm VOORDAT vite geladen wordt
const Module = await import("module");
const originalResolve = Module.default._resolveFilename;
Module.default._resolveFilename = function (request, parent, isMain, options) {
  if (request === "esbuild") {
    return originalResolve.call(this, "esbuild-wasm", parent, isMain, options);
  }
  return originalResolve.call(this, request, parent, isMain, options);
};

// Bouw de frontend
const { build } = await import("vite");
const tailwindcss = (await import("@tailwindcss/vite")).default;
const react = (await import("@vitejs/plugin-react-swc")).default;

console.log("Building frontend...");

await build({
  configFile: false,
  root: __dirname,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: false, // Geen esbuild minification nodig
    sourcemap: false,
  },
});

console.log("Build voltooid! Output in frontend/dist/");
