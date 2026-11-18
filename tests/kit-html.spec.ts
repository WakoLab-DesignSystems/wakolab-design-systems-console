// The delivered single HTML file (console-kit.html), opened directly from file:// with the network cut
// (standard DIRECTIONS §4 and CHECKLIST "Demo and HTML file" at 8e3b818; issue #8).
// Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at a45832769d41ec10c1c6e0dc6afa8f1c1061f99a
// (PR #7, under review), tests/kit-html.spec.ts. Console adaptation: the Screen menu and its six screens
// plus Overview, the state in the hash, Console's example values; added: Console's own LICENSE and every
// notice travel inside the file (Revex's H-R1 on folio#7, applied here), and the keyboard exit from the
// Screen menu at 320px (N-R1 on #7) inside the delivered file.
// It tests the committed file, not a fresh build: generate it with `npm run kit` from a committed source
// (scripts/build-html.mjs). Without the file, these tests are skipped and say so.
import { test, expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";
import { axe, noOverflow } from "./helpers";

const require = createRequire(import.meta.url);
const KIT = resolve("console-kit.html");
const URL_BASE = `file://${KIT}`;
const MENU: [string, string][] = [
  ["Overview", "Console"], ["Collection", "Datasets"], ["Detail", "Coastal temperatures"], ["Form", "Settings"],
  ["Message", "This page doesn't exist"], ["States", "States"], ["Components", "Components"],
];
test.skip(!existsSync(KIT), "console-kit.html is not generated in this checkout (npm run kit)");

/** An offline context that records every request; only the file itself may be requested. */
async function offline(browser: Browser, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ offline: true, viewport });
  const requests: string[] = [];
  context.on("request", (r) => requests.push(r.url()));
  return { context, requests };
}
const foreign = (requests: string[]) => requests.filter((u) => u.split("#")[0] !== URL_BASE && !u.startsWith("data:") && !u.startsWith("blob:"));
async function openKit(context: BrowserContext, hash: string) {
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(`${URL_BASE}${hash ? `#${hash}` : ""}`);
  await expect(page.locator('[data-wds="console"]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return { page, errors };
}
const trigger = (page: Page) => page.locator("#screen-menu");
const menu = (page: Page) => page.getByRole("navigation", { name: "Example screens" });
async function choose(page: Page, label: string) {
  await trigger(page).click();
  await menu(page).getByRole("link", { name: label, exact: true }).click();
}
async function setMode(page: Page, mode: "Light" | "Dark") {
  await page.getByRole("button", { name: /^Appearance/ }).click();
  await page.locator("label", { hasText: new RegExp(`^${mode}$`) }).click();
  await page.keyboard.press("Escape");
}
const root = (page: Page) => page.locator('[data-wds="console"]');
const action = (page: Page) => root(page).evaluate((e) => getComputedStyle(e).getPropertyValue("--wl-action").trim());
const uiFont = (page: Page) => root(page).evaluate((e) => getComputedStyle(e).getPropertyValue("--wl-font-ui").trim());

test("file://, network cut: Overview and the six screens by the menu, light and dark, embedded resources only, no request", async ({ browser }) => {
  const { context, requests } = await offline(browser);
  const { page, errors } = await openKit(context, "");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Datasets"); // opens on the collection, as over HTTP
  for (const mode of ["Dark", "Light"] as const) {
    await setMode(page, mode);
    await expect(root(page)).toHaveAttribute("data-mode", mode.toLowerCase());
    for (const [label, heading] of MENU) {
      await choose(page, label);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
      await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
      await expect(trigger(page)).toHaveAccessibleName(`Screen: ${label}`);
      await expect(root(page)).toHaveAttribute("data-mode", mode.toLowerCase());
      expect(new URL(page.url()).hash).toContain(`screen=${label.toLowerCase()}`);
    }
  }
  // A row link, then the browser's Back button.
  await choose(page, "Collection");
  await page.locator("a.wl-row").nth(1).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Pollinator counts");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Datasets");
  // Default fonts are embedded and load from the file.
  const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")); });
  for (const f of ["wds-console-default-jetbrains-mono"]) expect(fonts).toContain(f);
  // Every resource the page holds is inline: no element or stylesheet points outside the file.
  const outside = await page.evaluate(() => {
    const urls: string[] = [];
    document.querySelectorAll("[src],[href]").forEach((e) => { const v = e.getAttribute("src") ?? e.getAttribute("href") ?? ""; if (!/^(data:|blob:|#)/.test(v)) urls.push(v); });
    for (const sheet of [...document.styleSheets]) for (const rule of [...sheet.cssRules]) {
      for (const m of rule.cssText.matchAll(/url\("?([^")]+)"?\)/g)) if (!/^(data:|blob:)/.test(m[1])) urls.push(m[1]);
    }
    return urls;
  });
  expect(outside).toEqual([]);
  expect(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content")).toContain("connect-src 'none'");
  expect(await page.locator('meta[name="console-kit-source"]').getAttribute("content")).toMatch(/^[0-9a-f]{40}$/);
  expect(foreign(requests)).toEqual([]);
  expect(errors).toEqual([]);
  await context.close();
});

test("the notices travel with the file: Console's MIT LICENSE and every third-party licence (H-R1 on folio#7)", async ({ browser }) => {
  const bytes = readFileSync(KIT, "utf8");
  const licence = readFileSync("LICENSE", "utf8");
  const copyright = licence.split("\n").find((l) => l.startsWith("Copyright"))!;
  expect(copyright).toMatch(/^Copyright \(c\) 2026 WakoLab-DesignSystems/);
  expect(bytes).toContain(copyright); // in the generated artifact itself
  const { context } = await offline(browser);
  const { page } = await openKit(context, "screen=overview");
  const section = page.locator("section", { has: page.getByRole("heading", { name: "Licences" }) });
  for (const [summary, file] of [
    ["Console (MIT): LICENSE", "LICENSE"], ["Third-party notices", "THIRD_PARTY_NOTICES.md"], ["JetBrains Mono (OFL-1.1)", "licenses/jetbrains-mono-OFL-1.1.txt"],
    ["DM Sans (OFL-1.1)", "licenses/dm-sans-OFL-1.1.txt"], ["Noto Sans SC (OFL-1.1)", "licenses/noto-sans-sc-OFL-1.1.txt"],
    ["Noto Sans Devanagari (OFL-1.1)", "licenses/noto-sans-devanagari-OFL-1.1.txt"], ["Tailwind CSS (MIT)", "licenses/tailwindcss-MIT.txt"],
    ["React, React DOM, Scheduler (MIT; in the HTML file only)", "licenses/react-MIT.txt"],
  ]) {
    const details = section.locator("details", { has: page.locator("summary", { hasText: summary }) });
    await details.locator("summary").click();
    // The whole text, exactly as in the repository file.
    expect(await details.locator("pre").textContent(), file).toBe(readFileSync(file, "utf8"));
  }
  await context.close();
});

test("file://: the embedded example configuration applies its colours, interface font and logo", async ({ browser }) => {
  const { context, requests } = await offline(browser);
  const { page } = await openKit(context, "screen=overview&mode=light");
  await page.getByRole("button", { name: "Example configuration" }).click();
  await expect(page).toHaveURL(/config=example/);
  await expect.poll(() => action(page)).toBe("#0e7c66");
  await expect.poll(() => page.locator(".wl-brand img").evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).naturalWidth > 0))).toEqual([true, true]);
  await expect.poll(() => uiFont(page)).toMatch(/^"?wds-console-font-[0-9a-f]{8}/);
  await choose(page, "Detail");
  await expect(page.locator(".wl-brand img").first()).toBeVisible();
  expect(new URL(page.url()).hash).toContain("config=example");
  expect(foreign(requests)).toEqual([]);
  await context.close();
});

test("file://: your configuration and files from the disk, kept while navigating; after a reload the values stay and the files are selected again", async ({ browser }) => {
  const { context, requests } = await offline(browser);
  const { page } = await openKit(context, "screen=overview&mode=dark");
  const config = JSON.parse(readFileSync("examples/public/design/design-config.json", "utf8"));
  config.colors.dark.action = "#c792ea";
  await page.locator("#local-config").setInputFiles({ name: "design-config.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(config)) });
  await expect(page).toHaveURL(/config=local&local=/);
  await expect.poll(() => action(page)).toBe("#c792ea");
  const status = page.locator("#local-file-status");
  await expect(status.getByText("not selected yet")).toHaveCount(4);
  await expect(page.locator(".wl-brand img")).toHaveCount(0); // no logo file yet: the text logo
  const file = (path: string, name: string, mimeType: string) => ({ name, mimeType, buffer: readFileSync(path) });
  await page.locator("#local-files").setInputFiles([
    file(require.resolve("@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2"), "example-sans.woff2", "font/woff2"),
    file("examples/public/design/logo/mark.svg", "mark.svg", "image/svg+xml"),
    file("examples/public/design/logo/wordmark-light.svg", "wordmark-light.svg", "image/svg+xml"),
    file("examples/public/design/logo/wordmark-dark.svg", "wordmark-dark.svg", "image/svg+xml"),
  ]);
  await expect(status.getByText("not selected yet")).toHaveCount(0);
  await expect.poll(() => page.locator(".wl-brand img").evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src.slice(0, 5)))).toEqual(["blob:", "blob:"]);
  await expect.poll(() => uiFont(page)).toMatch(/^"?wds-console-font-[0-9a-f]{8}/);
  // Navigation keeps the configuration and the selected files.
  for (const label of ["Collection", "Detail", "Components", "Overview"]) {
    await choose(page, label);
    expect(new URL(page.url()).hash).toMatch(/config=local&local=/);
    await expect(page.locator(".wl-brand img").first()).toHaveAttribute("src", /^blob:/);
    expect(await action(page)).toBe("#c792ea");
  }
  // Reload: the values come back from the hash; the files must be selected again.
  await page.reload();
  await expect(root(page)).toBeVisible();
  await expect(root(page)).toHaveAttribute("data-mode", "dark");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Console");
  await expect.poll(() => action(page)).toBe("#c792ea");
  await expect(status.getByText("not selected yet")).toHaveCount(4);
  await expect(page.locator(".wl-brand img")).toHaveCount(0);
  expect(await uiFont(page)).toMatch(/^"?wds-console-default-jetbrains-mono/);
  // An invalid file changes nothing and says so.
  await page.locator("#local-config").setInputFiles({ name: "broken.json", mimeType: "application/json", buffer: Buffer.from("{ not json") });
  await expect(page.getByText(/broken\.json is not a valid JSON file/)).toBeVisible();
  await expect.poll(() => action(page)).toBe("#c792ea");
  expect(foreign(requests)).toEqual([]);
  await context.close();
});

for (const mode of ["light", "dark"] as const)
  test(`file://, ${mode}, 320 × 720: keyboard exit from the Screen menu (N-R1 on #7) in the delivered file`, async ({ browser }) => {
    const { context, requests } = await offline(browser, { width: 320, height: 720 });
    const { page } = await openKit(context, `screen=components&mode=${mode}`);
    const panels = page.locator('[data-wds-popover][data-open="true"]');
    await trigger(page).focus();
    await page.keyboard.press("Enter");
    for (const [label] of MENU) {
      await page.keyboard.press("Tab");
      await expect(menu(page).getByRole("link", { name: label, exact: true })).toBeFocused();
    }
    await page.keyboard.press("Tab"); // past the last destination
    await expect(panels).toHaveCount(0);
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("button", { name: /^Appearance/ })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Enter"); // reopen from the trigger, then leave backwards
    await expect(panels).toHaveCount(1);
    await page.keyboard.press("Shift+Tab");
    await expect(panels).toHaveCount(0);
    expect(await noOverflow(page)).toBe(true);
    expect(foreign(requests)).toEqual([]);
    await context.close();
  });

for (const mode of ["light", "dark"])
  test(`file://, ${mode}: the presentation page (configuration panel and licences) is axe A/AA clean and reflows from 320px`, async ({ browser }) => {
    const { context } = await offline(browser);
    const { page } = await openKit(context, `screen=overview&mode=${mode}`);
    expect(await axe(page)).toEqual([]);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await noOverflow(page), `overflow at ${width}`).toBe(true);
    }
    await context.close();
  });
