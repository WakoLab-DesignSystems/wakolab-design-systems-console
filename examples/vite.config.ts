// Vite config for the examples. The examples import the BUILT package: the package name is
// aliased to ../dist, so `npm run build` must run first. Original code.
import { defineConfig } from "vite";
import { resolve } from "node:path";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";

const root = resolve(__dirname);
const dist = resolve(__dirname, "../dist");
// The example configuration references a local font file. It is copied from the declared
// @fontsource-variable/dm-sans package (OFL-1.1) so that no font binary is committed twice.
const fontDir = resolve(root, "public/design/fonts");
mkdirSync(fontDir, { recursive: true });
const font = resolve(__dirname, "../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2");
if (existsSync(font)) copyFileSync(font, resolve(fontDir, "example-sans.woff2"));

export default defineConfig({
  root,
  publicDir: resolve(root, "public"),
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      { find: /^wakolab-design-systems-console\/console\.css$/, replacement: resolve(dist, "console.css") },
      { find: /^wakolab-design-systems-console$/, replacement: resolve(dist, "index.js") },
    ],
  },
  server: { host: "127.0.0.1", port: 5190, strictPort: true, fs: { allow: [resolve(__dirname, "..")] } },
  preview: { host: "127.0.0.1", port: 5190, strictPort: true },
  build: { outDir: resolve(__dirname, "../.example-dist"), emptyOutDir: true,
    rollupOptions: { input: { neutral: resolve(root, "neutral/index.html"), harness: resolve(root, "harness/index.html"), parity: resolve(root, "parity/index.html") } } },
});
