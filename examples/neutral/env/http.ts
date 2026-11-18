// Example environment, HTTP mode (`npm run example`). Copied from WakoLab-DesignSystems/wakolab-design-systems-folio at a45832769d41ec10c1c6e0dc6afa8f1c1061f99a (PR #7, under review),
// examples/demo/env/http.ts; Console adaptation: Console names, the example lives in examples/public/design
// (served at /design/), and the navigation state stays in the query string, as integrated in #7.
// The example configuration and its files are read from /design/ at each page load, with assetBase
// "/design/" (standard DIRECTIONS §4 at 8e3b818). Selected by the "console-example-env" alias in
// examples/vite.config.ts; the offline HTML file uses ./offline.ts.
import type { DesignConfig } from "wakolab-design-systems-console";
import { EXAMPLE_PATHS, KIT_STANDARD_SHA } from "./shared";

export const KIT = { offline: false, sourceSha: undefined as string | undefined, standardSha: KIT_STANDARD_SHA,
  /** Where the screen, mode and configuration live in the address: the query string over HTTP (#7). */
  stateIn: "query" as "query" | "hash" };
/** The example configuration and the files it names, for download. */
export const EXAMPLE_FILES = ["design-config.json", ...EXAMPLE_PATHS].map((path) => ({ path, url: `/design/${path}` }));
export async function loadExample(): Promise<{ config: DesignConfig; assetBase: string | undefined }> {
  const response = await fetch("/design/design-config.json");
  return { config: await response.json(), assetBase: "/design/" };
}
