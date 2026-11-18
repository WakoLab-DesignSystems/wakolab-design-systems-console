// Example environment, offline mode: used only when building the single HTML file (console-kit.html,
// scripts/build-html.mjs). Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at a45832769d41ec10c1c6e0dc6afa8f1c1061f99a (PR #7, under review),
// examples/demo/env/offline.ts; Console adaptation: Console names and example paths, and the navigation
// state in the URL hash (KIT_PROPOSAL §2: the hash survives a reload of a file:// page, whereas changing
// the query of a file:// URL with history.pushState is not allowed by every browser).
// The example configuration and every file it names are embedded as data: URLs, so the example works
// from file:// with no request (standard DIRECTIONS §4 and KIT_PROPOSAL §2 at 8e3b818). The example
// font is the file the HTTP example serves (examples/vite.config.ts copies it from the declared
// @fontsource-variable/dm-sans package).
import type { DesignConfig } from "wakolab-design-systems-console";
import exampleConfig from "../../public/design/design-config.json";
import exampleConfigText from "../../public/design/design-config.json?raw";
import mark from "../../public/design/logo/mark.svg?inline";
import wordmarkLight from "../../public/design/logo/wordmark-light.svg?inline";
import wordmarkDark from "../../public/design/logo/wordmark-dark.svg?inline";
import exampleFont from "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?inline";
import { EXAMPLE_PATHS, KIT_STANDARD_SHA, withFiles } from "./shared";

declare const __CONSOLE_SOURCE_SHA__: string;
export const KIT = { offline: true, sourceSha: __CONSOLE_SOURCE_SHA__ as string | undefined, standardSha: KIT_STANDARD_SHA,
  stateIn: "hash" as "query" | "hash" };
const EMBEDDED: Record<(typeof EXAMPLE_PATHS)[number], string> = {
  "fonts/example-sans.woff2": exampleFont, "logo/mark.svg": mark, "logo/wordmark-light.svg": wordmarkLight, "logo/wordmark-dark.svg": wordmarkDark,
};
export const EXAMPLE_FILES = [
  { path: "design-config.json", url: "data:application/json;charset=utf-8," + encodeURIComponent(exampleConfigText) },
  ...EXAMPLE_PATHS.map((path) => ({ path, url: EMBEDDED[path] })),
];
export async function loadExample(): Promise<{ config: DesignConfig; assetBase: string | undefined }> {
  return { config: withFiles(exampleConfig, (path) => EMBEDDED[path as keyof typeof EMBEDDED]).config, assetBase: undefined };
}
