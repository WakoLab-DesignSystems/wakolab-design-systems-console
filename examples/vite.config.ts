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
// Distinct faces for the font-selection test (tests/config.spec.ts): regular, italic and a
// Cyrillic subset of DM Sans and JetBrains Mono, copied from the declared OFL packages.
for (const [pkg, file, name] of [
  ["dm-sans", "dm-sans-latin-wght-italic.woff2", "test-italic.woff2"],
  ["jetbrains-mono", "jetbrains-mono-latin-wght-normal.woff2", "test-bold.woff2"],
  ["jetbrains-mono", "jetbrains-mono-cyrillic-wght-normal.woff2", "test-cyrillic.woff2"],
]) {
  const from = resolve(__dirname, `../node_modules/@fontsource-variable/${pkg}/files/${file}`);
  if (existsSync(from)) copyFileSync(from, resolve(fontDir, name));
}

export default defineConfig({
  root,
  publicDir: resolve(root, "public"),
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: [
      { find: /^wakolab-design-systems-console\/console\.css$/, replacement: resolve(dist, "console.css") },
      { find: /^wakolab-design-systems-console$/, replacement: resolve(dist, "index.js") },
      { find: /^parity-sys$/, replacement: resolve(root, "parity/fixture/console-sys.tsx") },
    ],
  },
  server: { host: "127.0.0.1", port: 5190, strictPort: true, fs: { allow: [resolve(__dirname, "..")] } },
  preview: { host: "127.0.0.1", port: 5190, strictPort: true },
  build: { outDir: resolve(__dirname, "../.example-dist"), emptyOutDir: true,
    rollupOptions: { input: { neutral: resolve(root, "neutral/index.html"), harness: resolve(root, "harness/index.html"), parity: resolve(root, "parity/index.html"), fixture: resolve(root, "parity/fixture/index.html") } } },
});
