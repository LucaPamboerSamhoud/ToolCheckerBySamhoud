// Patch esbuild met esbuild-wasm bestanden.
// Draai dit na elke `npm install` om de EPERM-restricties te omzeilen.
// Gebruik: node patch-esbuild.mjs

import { copyFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const esbuild = join(__dirname, "node_modules", "esbuild");
const esbuildWasm = join(__dirname, "node_modules", "esbuild-wasm");

if (!existsSync(esbuildWasm)) {
  console.error("esbuild-wasm niet gevonden. Installeer met: npm install esbuild-wasm");
  process.exit(1);
}

const files = [
  ["lib/main.js", "lib/main.js"],
  ["lib/main.d.ts", "lib/main.d.ts"],
  ["bin/esbuild", "bin/esbuild"],
  ["esbuild.wasm", "esbuild.wasm"],
  ["wasm_exec.js", "wasm_exec.js"],
  ["wasm_exec_node.js", "wasm_exec_node.js"],
];

let count = 0;
for (const [src, dest] of files) {
  const srcPath = join(esbuildWasm, src);
  const destPath = join(esbuild, dest);
  if (existsSync(srcPath)) {
    copyFileSync(srcPath, destPath);
    count++;
  }
}

console.log(`esbuild gepatcht met esbuild-wasm (${count} bestanden gekopieerd)`);
