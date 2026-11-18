// Shipped defaults on the neutral example (standard INDEPENDENCE_CHECK §2 "Shipped defaults").
import { test, expect } from "@playwright/test";
import { axe, noOverflow, open } from "./helpers";

const screens = ["overview", "collection", "detail", "form", "message", "states", "components"]; // overview: the presentation page (#8)
for (const mode of ["light", "dark"])
  test(`${mode}: every example screen is axe A/AA clean and reflows from 320px`, async ({ page }) => {
    for (const screen of screens) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await open(page, `screen=${screen}&mode=${mode}`);
      await expect(page.locator('[data-wds="console"]')).toHaveAttribute("data-mode", mode);
      expect(await axe(page), `${screen}`).toEqual([]);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await noOverflow(page), `${screen} overflow at ${width}`).toBe(true);
      }
    }
  });

test("identity: Console tokens, mono UI, 44px minimum rows, rail from 64rem, square geometry", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "screen=collection&mode=light");
  const s = await page.evaluate(() => {
    const root = document.querySelector('[data-wds="console"]')!;
    const row = document.querySelector("a.wl-row") as HTMLElement;
    const cs = getComputedStyle(root);
    return { bg: cs.backgroundColor, font: getComputedStyle(row).fontFamily, rowH: row.getBoundingClientRect().height,
      rail: getComputedStyle(document.querySelector(".wl-rail")!).display, radius: getComputedStyle(document.querySelector(".wl-table")!).borderRadius,
      prompt: getComputedStyle(document.querySelector(".wl-prompt")!).color };
  });
  expect(s.bg).toBe("rgb(245, 244, 239)");
  expect(s.font).toContain("wds-console-default-jetbrains-mono");
  expect(s.rowH).toBeGreaterThanOrEqual(44);
  expect(s.rail).toBe("grid");
  expect(s.radius).toBe("6px");
  expect(s.prompt).toBe("rgb(138, 75, 10)");
  await page.setViewportSize({ width: 800, height: 900 });
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".wl-rail")!).display)).toBe("none");
});

test("keyboard layer: / focuses search, j/k move between rows, ignored while typing; Enter opens", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "screen=collection&mode=light");
  await page.keyboard.press("/");
  expect(await page.evaluate(() => (document.activeElement as HTMLInputElement).type)).toBe("search");
  await page.keyboard.type("j");
  expect(await page.evaluate(() => (document.activeElement as HTMLInputElement).value)).toBe("j");
  await page.keyboard.press("Control+a"); await page.keyboard.press("Delete");
  await page.locator("h1").click();
  await page.keyboard.press("j"); await page.keyboard.press("j"); await page.keyboard.press("k");
  expect(await page.evaluate(() => document.activeElement?.getAttribute("data-wds-item"))).toBe("coastal-temperatures");
  await page.keyboard.press("j");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/screen=detail&id=pollinator-counts/);
});

test("tabs, confirmation dialog, backdrop scrim and focus return, light and dark", async ({ page }) => {
  for (const [mode, scrim] of [["light", "rgba(28, 30, 27, 0.45)"], ["dark", "rgba(0, 0, 0, 0.6)"]]) {
    await open(page, `screen=detail&mode=${mode}`);
    const about = page.getByRole("tab", { name: "About" });
    await about.focus(); await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Files" })).toHaveAttribute("aria-selected", "true");
    await page.locator("#request").focus(); await page.keyboard.press("Enter");
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Not now" })).toBeFocused();
    expect(await dialog.evaluate((d) => getComputedStyle(d, "::backdrop").backgroundColor)).toBe(scrim);
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
    await expect(page.locator("#request")).toBeFocused();
  }
});

test("popover: Escape inside closes and returns focus; outside pointer-down closes without moving focus", async ({ page }) => {
  await open(page, "screen=components&mode=light");
  await page.locator("#more-actions").click();
  await expect(page.getByRole("group", { name: "More actions" })).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("group", { name: "More actions" })).toHaveCount(0);
  await expect(page.locator("#more-actions")).toBeFocused();
  await page.locator("#more-actions").click();
  await page.mouse.click(5, 300);
  await expect(page.getByRole("group", { name: "More actions" })).toHaveCount(0);
});

test("reduced motion: no animation in the root; dialog appears without animation", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await open(page, "screen=components&mode=light");
  await page.locator("#dialog-btn").click();
  expect(await page.locator("dialog[open]").evaluate((d) => getComputedStyle(d).animationName)).toBe("none");
  await page.keyboard.press("Escape");
  await open(page, "screen=states&mode=dark");
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await ctx.close();
  const p2 = await browser.newPage();
  await open(p2, "screen=components&mode=light");
  await p2.locator("#dialog-btn").click();
  expect(await p2.locator("dialog[open]").evaluate((d) => getComputedStyle(d).animationName)).toBe("wds-console-wl-rise");
  await p2.close();
});

test("toast does not take focus; busy button keeps its name", async ({ page }) => {
  await open(page, "screen=components&mode=light");
  await page.locator("#toast-btn").click();
  await expect(page.getByText("Saved. This message is not urgent.")).toBeVisible();
  await expect(page.locator("#toast-btn")).toBeFocused();
  await expect(page.getByRole("button", { name: "Saving" })).toHaveAttribute("aria-busy", "true");
});

test("icons: rendered icon slots carry no path data and are marked missing (package and documentation: scripts/check-artwork.mjs)", async ({ page }) => {
  await open(page, "screen=components&mode=light");
  const r = await page.evaluate(() => ({ svgs: document.querySelectorAll("svg[data-icon]").length, missing: document.querySelectorAll("svg[data-icon-missing]").length, paths: document.querySelectorAll("svg[data-icon] path").length }));
  expect(r.svgs).toBeGreaterThan(0);
  expect(r.missing).toBe(r.svgs);
  expect(r.paths).toBe(0);
});

// Review S1 on #5: the registration frame, and the fixture's real form and component sheet, with
// Console only (no frontend modules): axe A/AA and reflow, light and dark. Icon slots stay empty here.
for (const mode of ["light", "dark"])
  test(`${mode}: registration frame, form and component fixtures are axe A/AA clean and reflow from 320px`, async ({ page }) => {
    for (const screen of ["registration", "form", "components"]) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/parity/fixture/index.html?screen=${screen}&mode=${mode}`);
      await expect(page.locator(`[data-wds="console"][data-mode="${mode}"]`)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await axe(page), screen).toEqual([]);
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await noOverflow(page), `${screen} overflow at ${width}`).toBe(true);
      }
    }
  });
