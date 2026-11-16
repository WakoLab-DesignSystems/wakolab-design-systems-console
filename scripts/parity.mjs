// Visual parity check (standard EXTRACTION_MATRIX §8 at 6dc2a7a). Original code.
//
// Compares the Console screens of the WakoLab frontend review prototype (the baseline) with the
// same synthetic screens rendered by this package (examples/parity, the candidate), at 360, 768,
// 1024 and 1440 px, light and dark, in the same browser and fonts.
//
// The baseline is NOT built or fetched by this script: run the frontend prototype yourself from a
// read-only checkout of WakoLab/wakolab-front at e492bec9ced8893d6940879aa8186ac75a48a272
// (`npm ci && npm run prototype -- --port 5174`, or serve its `vite.prototype.config.ts` build), then:
//
//   npm run build && npx vite --config examples/vite.config.ts &      # candidate on :5190
//   node scripts/parity.mjs --icons <front checkout>/web/src/components/ui/icons.tsx
//
// --icons reads the frontend's icon path data at run time and injects it into the candidate page
// only for this comparison; nothing from it is written to this repository (icon provenance is
// unresolved, EXTRACTION_MATRIX §10, E4). Without --icons the candidate renders empty icon slots
// and every icon shows as a difference.
//
// Capture settings: Chromium from @playwright/test 1.56.1 (or CHROMIUM_PATH), viewport width as
// listed and height 900, device scale factor 1, reduced motion emulated, document.fonts.ready
// awaited, full-page screenshots with animations disabled and the caret hidden. Output (ignored by
// Git): parity-output/<screen>-<mode>-<width>/{baseline,candidate,diff,side-by-side}.png,
// parity-output/report.json and parity-output/report.md.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const BASELINE = arg("--baseline", "http://127.0.0.1:5174/prototype/index.html");
const CANDIDATE = arg("--candidate", "http://127.0.0.1:5190/parity/index.html");
const OUT = arg("--out", "parity-output");
const ICONS = arg("--icons", null);
const WIDTHS = (arg("--widths", "360,768,1024,1440")).split(",").map(Number);
const MODES = (arg("--modes", "light,dark")).split(",");
const ONLY = arg("--screens", null)?.split(",");

// Screen → baseline query (prototype, frame mode, English, signed out, MVP) and candidate screen.
const SCREENS = {
  collection: { baseline: "" },
  detail: { baseline: "&view=project&slug=paperwars" },
  notFound: { baseline: "&view=missing" },
  message: { baseline: "&view=propose" },
  loading: { baseline: "&scenario=loading" },
  unavailable: { baseline: "&scenario=unavailable" },
  dialog: { baseline: "", openDialog: true },
};

function readIcons(file) {
  if (!file) return null;
  const src = readFileSync(file, "utf8");
  const block = /const paths = \{([\s\S]*?)\n\}( as const)?;/.exec(src);
  if (!block) throw new Error(`no icon path table found in ${file}`);
  return Object.fromEntries([...block[1].matchAll(/^\s*(\w+):\s*"([^"]*)"/gm)].map((m) => [m[1], m[2]]));
}
const icons = readIcons(ICONS);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const version = browser.version();

async function capture({ url, mode, width, init, after }) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce", colorScheme: mode });
  if (init) await context.addInitScript(init.fn, init.arg);
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  if (after) await page.evaluate(after);
  await page.waitForTimeout(250);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
  await context.close();
  return png;
}

// Pixel comparison in the browser (no image dependency): exact and with a per-channel tolerance.
const diffPage = await (await browser.newContext({ deviceScaleFactor: 1 })).newPage();
async function compare(a, b) {
  return diffPage.evaluate(async ([a64, b64]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + s; });
    const [A, B] = await Promise.all([load(a64), load(b64)]);
    const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
    const read = (img) => { const c = new OffscreenCanvas(w, h); const x = c.getContext("2d"); x.fillStyle = "#ff00ff"; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
    const pa = read(A), pb = read(B);
    const diff = new OffscreenCanvas(w, h), dx = diff.getContext("2d");
    dx.globalAlpha = 0.25; dx.drawImage(A, 0, 0); dx.globalAlpha = 1;
    const out = dx.getImageData(0, 0, w, h);
    let exact = 0, tolerant = 0, maxDelta = 0; let minX = w, minY = h, maxX = -1, maxY = -1;
    for (let p = 0; p < pa.length; p += 4) {
      const d = Math.max(Math.abs(pa[p] - pb[p]), Math.abs(pa[p + 1] - pb[p + 1]), Math.abs(pa[p + 2] - pb[p + 2]));
      if (d > 0) exact++;
      if (d > maxDelta) maxDelta = d;
      if (d > 16) {
        tolerant++; out.data[p] = 230; out.data[p + 1] = 0; out.data[p + 2] = 0; out.data[p + 3] = 255;
        const i = p / 4, x = i % w, y = (i - x) / w;
        if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y;
      }
    }
    dx.putImageData(out, 0, 0);
    const side = new OffscreenCanvas(w * 3 + 32, h), sx = side.getContext("2d");
    sx.fillStyle = "#808080"; sx.fillRect(0, 0, side.width, h);
    sx.drawImage(A, 0, 0); sx.drawImage(B, w + 16, 0); sx.drawImage(diff, 2 * w + 32, 0);
    const toB64 = async (c) => { const blob = await c.convertToBlob({ type: "image/png" }); const buf = new Uint8Array(await blob.arrayBuffer()); let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000)); return btoa(s); };
    return { sizeA: [A.width, A.height], sizeB: [B.width, B.height], pixels: w * h, exact, tolerant, maxDelta, box: maxX < 0 ? null : [minX, minY, maxX, maxY], diff: await toB64(diff), side: await toB64(side) };
  }, [a.toString("base64"), b.toString("base64")]);
}

const rows = [];
for (const [screen, spec] of Object.entries(SCREENS)) {
  if (ONLY && !ONLY.includes(screen)) continue;
  for (const mode of MODES) for (const width of WIDTHS) {
    const name = `${screen}-${mode}-${width}`;
    const dir = join(OUT, name); mkdirSync(dir, { recursive: true });
    const baseline = await capture({
      url: `${BASELINE}?frame=1&lang=en${spec.baseline}`, mode, width,
      init: { fn: (m) => { localStorage.setItem("wakolab_prototype_appearance_v1", JSON.stringify({ theme: "console", mode: m })); localStorage.setItem("wakolab_locale", "en"); }, arg: mode },
      after: spec.openDialog ? () => { const d = document.querySelector("dialog.wl-dialog"); d.showModal(); d.querySelector("[data-autofocus]")?.focus(); } : null,
    });
    const candidate = await capture({
      url: `${CANDIDATE}?screen=${screen}&mode=${mode}`, mode, width,
      init: icons ? { fn: (set) => { window.__CONSOLE_ICONS__ = set; }, arg: icons } : null,
    });
    const r = await compare(baseline, candidate);
    writeFileSync(join(dir, "baseline.png"), baseline);
    writeFileSync(join(dir, "candidate.png"), candidate);
    writeFileSync(join(dir, "diff.png"), Buffer.from(r.diff, "base64"));
    writeFileSync(join(dir, "side-by-side.png"), Buffer.from(r.side, "base64"));
    const row = { screen, mode, width, baselineSize: r.sizeA, candidateSize: r.sizeB, pixels: r.pixels, differentExact: r.exact, differentOver16: r.tolerant, maxChannelDelta: r.maxDelta, box: r.box };
    rows.push(row);
    console.log(`${name.padEnd(26)} ${r.sizeA.join("×").padEnd(10)} vs ${r.sizeB.join("×").padEnd(10)} exact ${String(r.exact).padStart(7)}  >16 ${String(r.tolerant).padStart(7)}  max delta ${String(r.maxDelta).padStart(3)}${r.box ? "  box " + r.box.join(",") : ""}`);
  }
}
await browser.close();

const settings = { baseline: BASELINE, candidate: CANDIDATE, browser: `Chromium ${version}`, playwright: "1.56.1", viewportHeight: 900, deviceScaleFactor: 1, reducedMotion: "reduce", fullPage: true, animations: "disabled", icons: icons ? `injected from ${ICONS} at run time (${Object.keys(icons).length} names)` : "not injected" };
writeFileSync(join(OUT, "report.json"), JSON.stringify({ settings, rows }, null, 2) + "\n");
const md = [`# Visual parity report`, "", "```json", JSON.stringify(settings, null, 2), "```", "",
  "| Screen | Mode | Width | Baseline size | Candidate size | Pixels different (exact) | Pixels different (>16/255) | Max channel delta |", "|---|---|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.screen} | ${r.mode} | ${r.width} | ${r.baselineSize.join("×")} | ${r.candidateSize.join("×")} | ${r.differentExact} | ${r.differentOver16} | ${r.maxChannelDelta} |`)].join("\n");
writeFileSync(join(OUT, "report.md"), md + "\n");
const failing = rows.filter((r) => r.differentExact > 0 || r.baselineSize.join() !== r.candidateSize.join());
console.log(`\n${rows.length} comparisons, ${rows.length - failing.length} identical, ${failing.length} with differences. Report: ${join(OUT, "report.md")}`);
process.exitCode = failing.length ? 1 : 0;
