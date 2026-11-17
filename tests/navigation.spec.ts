// Screen navigation of the neutral example (issue #6): the header's Screen menu reaches the six screens,
// marks the active one, and keeps the chosen mode and example configuration. Original code.
import { expect, test, type Page } from "@playwright/test";
import { axe, noOverflow, open } from "./helpers";

const SCREENS = [
  ["collection", "Collection", "Datasets"], ["detail", "Detail", "Coastal temperatures"], ["form", "Form", "Settings"],
  ["message", "Message", "This page doesn't exist"], ["states", "States", "States"], ["components", "Components", "Components"],
] as const;

const trigger = (page: Page) => page.locator("#screen-menu");
const menu = (page: Page) => page.getByRole("navigation", { name: "Example screens" });
const root = (page: Page) => page.locator('[data-wds="console"]');
const query = (page: Page) => new URL(page.url()).searchParams;

async function choose(page: Page, label: string) {
  await trigger(page).click();
  await menu(page).getByRole("link", { name: label, exact: true }).click();
}

test("the menu reaches all six screens and marks the active one", async ({ page }) => {
  await open(page, "mode=light");
  await expect(trigger(page)).toHaveAccessibleName("Screen Collection");
  for (const [id, label, heading] of SCREENS) {
    await choose(page, label);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
    expect(query(page).get("screen")).toBe(id);
    await expect(page).toHaveTitle(`${label} · Console example`);
    await expect(trigger(page)).toHaveAccessibleName(`Screen ${label}`);
    await trigger(page).click();
    const current = menu(page).locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(`›${label}`);
    await page.keyboard.press("Escape");
    await expect(menu(page)).toHaveCount(0);
  }
});

test("mode and example configuration persist across menu, links, reload, history and new tabs", async ({ page, context }) => {
  await open(page, "screen=collection&config=example");
  await expect(page.locator(".wl-logo-mark")).toBeVisible(); // the example configuration's logo is loaded
  const action = () => root(page).evaluate((el) => getComputedStyle(el).getPropertyValue("--wl-action").trim());
  const lightAction = await action();
  await page.getByRole("button", { name: /^Appearance/ }).click();
  await page.locator("label.wl-option", { hasText: "Dark" }).click(); // the visible option label, as a user would
  await expect(root(page)).toHaveAttribute("data-mode", "dark");
  const darkAction = await action();
  expect(darkAction).not.toBe(lightAction);
  expect(query(page).get("mode")).toBe("dark");
  await page.keyboard.press("Escape");

  const kept = async () => {
    await expect(root(page)).toHaveAttribute("data-mode", "dark");
    await expect(page.locator(".wl-logo-mark")).toBeVisible();
    expect(await action()).toBe(darkAction);
    expect(query(page).get("mode")).toBe("dark");
    expect(query(page).get("config")).toBe("example");
  };
  for (const [, label] of SCREENS) { await choose(page, label); await kept(); }
  await page.reload(); await kept();
  await page.goBack(); await kept();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("States");
  await page.goForward(); await kept();
  // In-page links keep the choices too: logo, a row, the back link.
  await page.getByRole("link", { name: "Field Lab, home" }).click(); await kept();
  await page.getByRole("link", { name: /Pollinator counts/ }).click(); await kept();
  expect(query(page).get("id")).toBe("pollinator-counts");
  await page.getByRole("link", { name: "Back to datasets" }).click(); await kept();
  // A modified click is left to the browser: the new tab opens with the same mode and configuration.
  await trigger(page).click();
  const [tab] = await Promise.all([context.waitForEvent("page"), menu(page).getByRole("link", { name: "Form" }).click({ modifiers: ["ControlOrMeta"] })]);
  await tab.waitForLoadState();
  const tabQuery = new URL(tab.url()).searchParams;
  expect([tabQuery.get("screen"), tabQuery.get("mode"), tabQuery.get("config")]).toEqual(["form", "dark", "example"]);
  await expect(tab.locator('[data-wds="console"]')).toHaveAttribute("data-mode", "dark");
  expect(query(page).get("screen")).toBe("collection"); // the original tab did not navigate
});

test("existing direct links keep working", async ({ page }) => {
  await open(page, "screen=detail&id=bus-punctuality&mode=dark");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Bus punctuality");
  await expect(root(page)).toHaveAttribute("data-mode", "dark");
  await expect(trigger(page)).toHaveAccessibleName("Screen Detail");
  await open(page, "screen=collection&state=unavailable");
  await expect(page.getByText("Datasets are unavailable right now")).toBeVisible();
  await open(page, "screen=unknown");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Datasets");
  await expect(trigger(page)).toHaveAccessibleName("Screen Collection");
});

test("keyboard: open, move, choose and close the menu; focus lands on the new heading", async ({ page }) => {
  await open(page, "screen=collection&mode=light");
  await trigger(page).focus();
  await page.keyboard.press("Enter");
  await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(menu(page).getByRole("link", { name: "Collection" })).toBeFocused();
  for (let n = 0; n < 4; n++) await page.keyboard.press("Tab");
  const states = menu(page).getByRole("link", { name: "States" });
  await expect(states).toBeFocused();
  const outline = await states.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe("none"); // visible focus indicator
  await page.keyboard.press("Enter");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toContainText("States");
  await expect(heading).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  // Escape closes the menu and returns focus to its trigger without navigating.
  await trigger(page).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(menu(page)).toHaveCount(0);
  await expect(trigger(page)).toBeFocused();
  expect(query(page).get("screen")).toBe("states");
});

for (const mode of ["light", "dark"] as const) {
  test(`${mode}: the open menu is axe A/AA clean, fully visible and usable from 320px`, async ({ page }) => {
    for (const width of [320, 480, 640, 800, 1024, 1280]) {
      await page.setViewportSize({ width, height: 720 });
      await open(page, `screen=components&mode=${mode}`);
      await trigger(page).click();
      await expect(menu(page)).toBeVisible();
      expect(await noOverflow(page), `overflow at ${width}px`).toBe(true);
      expect(await axe(page), `axe at ${width}px`).toEqual([]);
      for (const link of await menu(page).getByRole("link").all()) {
        await expect(link).toBeInViewport({ ratio: 1 }); // entirely on screen, not clipped at an edge
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      }
      await menu(page).getByRole("link", { name: "Detail" }).click();
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Coastal temperatures");
      expect(await noOverflow(page), `overflow after navigation at ${width}px`).toBe(true);
    }
  });
}
