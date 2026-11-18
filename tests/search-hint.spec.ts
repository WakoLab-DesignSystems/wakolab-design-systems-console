// Search text versus the "/" shortcut hint in Console's header (issue #10). Original code.
// The input's text (placeholder or typed value), clipped at the input's content box, must end before the
// hint, at every width, in light and dark, in the HTTP example and in the delivered offline file.
// The hint, the "/" shortcut and the clear button must keep working.
import { expect, test, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { open } from "./helpers";

const KIT = resolve("console-kit.html");
// 960–1056px is where the integrated header (4546c4a / 445bd06) squeezed the field; the others are neighbours.
const WIDTHS = [640, 768, 960, 992, 1008, 1016, 1024, 1032, 1040, 1056, 1088, 1280, 1440];
const LONG_QUERY = "coastal temperatures sea surface buoys daily readings archive";
const GAP = 4; // minimum clear space, in CSS pixels, between the text and the hint

/** Visible end of the input's text (clipped at its content box) and the hint's box, in CSS pixels. */
const geometry = (page: Page) => page.evaluate(() => {
  const input = document.querySelector<HTMLInputElement>(".wl-topbar-search input")!;
  const hint = document.querySelector<HTMLElement>(".wl-topbar-search .wl-kbd")!;
  const cs = getComputedStyle(input), box = input.getBoundingClientRect(), h = hint.getBoundingClientRect();
  const context = document.createElement("canvas").getContext("2d")!;
  context.font = cs.font;
  const start = box.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft);
  const contentEnd = box.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
  const text = input.value || input.placeholder;
  const clear = input.parentElement!.querySelector("button")?.getBoundingClientRect();
  return {
    textEnd: Math.min(start + context.measureText(text).width, contentEnd),
    hint: { left: h.left, right: h.right, top: h.top, bottom: h.bottom, width: h.width, height: h.height },
    field: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
    clear: clear ? { left: clear.left, right: clear.right } : null,
  };
});

async function checkWidth(page: Page, where: string) {
  const empty = await geometry(page);
  expect(empty.hint.width, `${where}: hint rendered`).toBeGreaterThan(8);
  expect(empty.hint.left >= empty.field.left && empty.hint.right <= empty.field.right
    && empty.hint.top >= empty.field.top && empty.hint.bottom <= empty.field.bottom, `${where}: hint inside the field`).toBe(true);
  expect.soft(empty.hint.left - empty.textEnd, `${where}: placeholder clear of the hint`).toBeGreaterThanOrEqual(GAP);
  const input = page.locator(".wl-topbar-search input");
  await input.fill(LONG_QUERY);
  const typed = await geometry(page);
  expect.soft(typed.hint.left - typed.textEnd, `${where}: typed text clear of the hint`).toBeGreaterThanOrEqual(GAP);
  expect(typed.clear, `${where}: clear button shown`).not.toBeNull();
  expect.soft(typed.clear!.left >= typed.hint.right || typed.clear!.right <= typed.hint.left, `${where}: clear button clear of the hint`).toBe(true);
  await input.fill("");
}

for (const mode of ["light", "dark"] as const) {
  test(`HTTP example, ${mode}: search text never runs under the "/" hint (640–1440px)`, async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 720 });
      await open(page, `screen=collection&mode=${mode}`);
      await checkWidth(page, `${width}px`);
    }
  });

  test(`offline file, ${mode}: search text never runs under the "/" hint (640–1440px)`, async ({ browser }) => {
    test.skip(!existsSync(KIT), "console-kit.html is not generated in this checkout (npm run kit)");
    const context = await browser.newContext({ offline: true });
    const page = await context.newPage();
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 720 });
      await page.goto(`file://${KIT}#screen=collection&mode=${mode}`);
      await page.reload(); // a new hash on the same file is applied at load
      await expect(page.locator('[data-wds="console"]')).toHaveAttribute("data-mode", mode);
      await page.evaluate(() => document.fonts.ready);
      await checkWidth(page, `file ${width}px`);
    }
    await context.close();
  });
}

test('the "/" shortcut still focuses the search; the hint stays visible next to a typed value', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 720 });
  await open(page, "screen=collection&mode=light");
  await page.locator("body").press("/");
  const input = page.getByRole("searchbox", { name: "Search datasets" });
  await expect(input).toBeFocused();
  await input.pressSequentially("pollinator");
  await expect(page.locator(".wl-topbar-search .wl-kbd")).toBeVisible();
  await expect(page.getByRole("link", { name: /Pollinator counts/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Coastal temperatures/ })).toHaveCount(0);
});
