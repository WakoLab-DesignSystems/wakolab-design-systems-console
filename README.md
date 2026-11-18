# wakolab-design-systems-console
Console: a terminal-inspired design system with compact layouts, monospace typography, and configurable light/dark colors, fonts and logos.

## Status

**Extraction integrated in `dev`** ([#1](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/issues/1)); the six-screen menu is integrated ([#7](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/pull/7)). The single offline HTML file is a **candidate** for [#8](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/issues/8), under review. Console's components, styles, tokens and compositions were extracted from the WakoLab frontend (provenance in [docs/PROVENANCE.md](docs/PROVENANCE.md)) following the [standard](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard) at `6dc2a7a`; the kit follows the integrated kit standard at `8e3b818`, the version this repository now declares. Nothing is released or published: the package is `private` and is used from a clone or a Git dependency.

**Kit index** (standard [DIRECTIONS §2](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/8e3b818ece8dbb57f48a2dc779ee743fe441aba4/docs/DIRECTIONS.md#2-what-a-kit-contains)):

| Kit element | Where | State |
|---|---|---|
| README, AGENTS, CONTRIBUTING, LICENSE, notices, AGENTS-SYNC, A2A | repository root, `.a2a/` | Present |
| Design rules | [docs/rules/](docs/rules/README.md) | Present |
| Configuration contract and example | [config.default.json](config.default.json), [config.schema.json](config.schema.json), [examples/public/design/](examples/public/design/design-config.json) | Present |
| Example with a menu: presentation page and six screens | `examples/neutral/` (`npm run example`) | Present |
| Single offline HTML file | [`console-kit.html`](console-kit.html) | **Candidate** (#8); see [Try it without installing](#try-it-without-installing) |
| Screenshots | below, taken from the HTML file | Present |
| Docker short start (maintained kit) | — | **Not delivered yet**: later batch. The `docker run` line under [Examples](#examples) is a convenience, not the kit |
| Figma companion (`.fig`) | — | **Not delivered yet**: after the standard's Figma spike |
| Manifest | [design-system.json](design-system.json) | Present |
| Checks on defaults, independence, artwork | `scripts/`, `tests/` | Present |
| Icon artwork | — | **Excluded**: see [Icons](#icons) |

**Known limits:** icon artwork is not included (see [Icons](#icons)); third-party material keeps its own licence (see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)); visual parity results are in [docs/PARITY.md](docs/PARITY.md).

## Try it without installing

One file, no installation, no network: [`console-kit.html`](console-kit.html) (about 7 MB) contains the whole example, its scripts and styles, every default font, the example configuration with its font and logos, and the licence notices.

| Light | Dark | Example configuration |
|---|---|---|
| ![Console collection screen in light mode: dense table rows with a filter rail](docs/screenshots/kit-light.png) | ![Console collection screen in dark mode](docs/screenshots/kit-dark.png) | ![Console detail screen with the example configuration: green actions, a sans interface font and the example logo](docs/screenshots/kit-example.png) |

**Download and open it**
1. Open [`console-kit.html`](console-kit.html) on GitHub and use **Download raw file** (GitHub shows the file's source, not the running page).
2. Double-click the downloaded file. It opens in your browser from your disk (`file://`) and works offline; it makes no network request.
3. The **Screen** menu in the header opens the presentation page (*Overview*) and the six screens: collection, detail, form, message, states and components. **Appearance** switches light and dark. The keyboard works as in the HTTP example: Tab walks the menu, and leaving it closes it.

**Use your own configuration, logo and fonts** (*Overview* page, section *Configuration*)
1. Under *Your configuration*, choose a `design-config.json` with **Configuration file**. Its colours apply at once. To start from the example, download its files from the links in the same section, then edit them.
2. Choose the font and logo files that the configuration names with **Font and logo files**. A file is matched by its file name; a list shows which named files are selected and which are not yet.
3. Everything stays on your computer: the files are read in memory, nothing is uploaded.

**What a reload keeps.** Navigating between screens keeps everything. After a reload (or reopening a bookmarked address):
- the screen, the mode and your configuration's values come back, because they are written in the page address (`#screen=…&mode=…&config=local&local=…`);
- **the font and logo files must be selected again**: a browser does not keep access to files from your disk. Until you select them, a font role without its file keeps Console's default, and the logo shows the `›` text logo;
- the shipped defaults and the example configuration are always available, since they are inside the file.

**Which version is it?** The file names the commit it was built from in its first lines and on the *Overview* page (`console-kit-source`). [Rebuilding it](#the-html-file-is-generated) from that commit gives the same bytes. Its *Licences* section carries Console's MIT licence and every third-party licence.

## About Console

Console is a terminal-inspired system: monospace interface type, dense rows with a 44px minimum height, a topbar plus rail shell from 64em, square geometry, flat surfaces and minimal motion. Default fonts: JetBrains Mono, DM Sans, Noto Sans SC, Noto Sans Devanagari (each under its own licence).

## Independent use

This repository is **self-contained**: it needs no other WakoLab or WakoLab-DesignSystems repository, submodule or sibling checkout. Requirements: Node.js 24 or later; React and React DOM 19.2.0 in the consuming app.

Use it in one of two ways:

- **Clone and build**, then depend on the folder or a packed tarball:

  ```bash
  git clone https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console.git
  ```

  ```bash
  cd wakolab-design-systems-console && npm ci
  ```

  `npm ci` builds `dist/` through the `prepare` script. `npm pack` makes a tarball that an app can install.
- **Git dependency**: `"wakolab-design-systems-console": "git+https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console.git#<commit>"`. npm runs `prepare`, which builds the package. Pin a commit.

## Usage

```tsx
import "wakolab-design-systems-console/console.css";
import { ConsoleRoot, ConsoleShell, ConsoleHeader, LogoSlot, Page, Button } from "wakolab-design-systems-console";

export function App({ config }) {
  return (
    <ConsoleRoot config={config} assetBase="/design/" defaultMode="system">
      <ConsoleShell header={<ConsoleHeader logo={<LogoSlot label="My App" />} />}>
        <Page><h1>Inventory</h1><Button>Add item</Button></Page>
      </ConsoleShell>
    </ConsoleRoot>
  );
}
```

- Everything renders inside `ConsoleRoot`, which outputs `<div data-wds="console" data-mode="light|dark">`. The stylesheet is prebuilt and scoped to that root: it does not style `html`, `body` or anything outside the root, and its cascade layers, keyframes, registered properties and font families carry the `wds-console-` prefix. Several roots can live on one page, each with its own mode and configuration.
- `ConsoleRoot` props: `mode` (controlled) or `defaultMode` (`"light"`, `"dark"` or `"system"`, default `"system"`), `onModeChange`, `storageKey` (persist the mode in `localStorage`; nothing is stored without it), `config`, `assetBase`, `icons`, `onDiagnostic`, `className`, `style`, `id`.
- Exports: components (Button, fields, Dialog, ConfirmDialog, Popover, Tabs, Toast, Skeleton…), parts (FilterTree, FilterChips, ItemLink, CollectionStatus, LoadMore, KeyValueList, MessageBlock, BackLink, LoadingState, ProblemState, LogoSlot, ToolButton, ModeMenu), compositions (ConsoleHeader, ConsoleShell, Page, CollectionLayout, CollectionSection, CollectionTable, RowContent, CollectionKeys, DetailLayout, DetailSection, DetailBody, Panel, FormPage, MessagePage, RegistrationFrame — a content-free two-column frame for sign-up or onboarding forms) and `useConsole`, `useCollectionKeys`, `normalizeConfig`. Package files: `console.css`, `config.default.json`, `config.schema.json`.
- **Keyboard layer:** `CollectionKeys` binds `/` (focus search) and `j`/`k` (move between items marked by `ItemLink`) inside its root. `scope="page"` listens on the whole page but only acts on its own root's collection; enable it on one root at a time. Shortcuts are ignored in text fields, with modifier keys and while a modal dialog is open.

## Configuration

Pass a parsed `design-config.json` as `config` ([schema](config.schema.json), [defaults](config.default.json), [specification](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/6dc2a7a38cc35b34f737c49e79077b025e47ab6c/docs/CONFIGURATION.md)). Every key except `system` and `systemVersion` is optional, and every value is used **exactly as written**. Omitted keys keep Console's defaults. Console derives no colour, checks no contrast and approves or rejects nothing; it only reports structural problems (wrong type, unknown key, unresolved file) through `onDiagnostic`.

```json
{
  "system": "console",
  "systemVersion": "0.1.0",
  "colors": {
    "light": { "action": "#0e7c66", "action-hover": "#0a6754" },
    "dark": { "action": "#76d2b9", "on-action": "#071d17" }
  },
  "fonts": { "ui": { "family": "Example Sans", "files": [{ "src": "fonts/example-sans.woff2", "weight": "100 1000" }] } },
  "logo": { "mark": "logo/mark.svg", "wordmark": { "light": "logo/wordmark-light.svg", "dark": "logo/wordmark-dark.svg" }, "alt": "Example App home" }
}
```

- **Colours:** per mode (`light`, `dark`), by role: `bg`, `surface`, `surface-2`, `ink`, `muted`, `border`, `control`, `action`, `action-hover`, `action-pressed`, `on-action`, `link`, `focus`, `accent`, `success`, `success-soft`, `warning`, `warning-soft`, `danger`, `danger-soft`, `info`, `info-soft`, `on-danger`, `scrim`, `shadow-card`, `shadow-pop`. Any CSS colour syntax. Setting `action` does not change `link` or `focus`. `action-pressed` defaults to the effective `action-hover` of the same mode.
- **Fonts:** roles `ui`, `display`, `prose`, `code`; each takes your own font files (`src`, optional `weight`, `style`, `stretch`, `unicodeRange`). Console registers them under an internal family name, so your `family` label never collides with other fonts on the page. Each role keeps its own default when omitted or removed (`ui`, `display` and `code`: JetBrains Mono; `prose`: DM Sans); configuring `ui` does not change the other roles.
- **Logo:** `mark` and/or `wordmark` (one file, or one per mode) and `alt`. Without logo files, the logo slot shows the text fallback (`›` and the label).
- **Paths:** relative file paths resolve against `assetBase`; absolute URLs are used as given. Console requests only these files and its own default font files from `dist/fonts/`.

Custom properties (`--wl-*`) can still be set on the root by hand as a low-level override; the configuration file is the supported way.

## Icons

Console ships **no icon artwork**: the provenance of the frontend's icon paths is unresolved (standard EXTRACTION_MATRIX §10, E4), so they were not copied. Components keep their icon slots (`search`, `x`, `check`, `chevronRight`, `chevronLeft`, `chevronDown`, `human`, `agent`, `lock`, `repo`, `clock`, `alert`, `info`, `offline`, `mail`, `globe`, `sun`, `moon`, `palette`, `spark`, `play`, `doc`, `external`, `list`, `user`). Supply your own icon set: an object that maps these names to SVG path data you are entitled to use, drawn for a 24×24 view box (the wrapper strokes paths at 1.75 with round caps and joins and no fill). Keep it in your own project and pass it to the root:

```tsx
import { myIconPaths } from "./icons/my-icon-paths"; // your file: { search: "<your path data>", x: "<your path data>", … }

<ConsoleRoot icons={myIconPaths}>…</ConsoleRoot>
```

A name without a path renders an empty box of the same size, marked `data-icon-missing`; nothing is substituted. `scripts/check-artwork.mjs` (part of `npm test`) fails if the documentation or the package contains SVG path data, or if any tracked file matches the excluded frontend icons (compared by one-way hashes only).

## Examples

```bash
npm run build && npm run example
```

- `http://127.0.0.1:5190/neutral/`: a neutral demonstration. The header's **Screen** menu opens the presentation page (*Overview*: identity, colour roles, typography, configuration, licences) and the six screens (collection, detail, form, message, states, components) and marks the active one. The same source builds the offline HTML file; only the loading differs (over HTTP, the example configuration is read from `/design/` at each load, and the state is in the query string). The chosen mode and configuration are kept when you navigate, reload or go back. Direct links still work: `?screen=` selects a screen; add `?config=example` to load `examples/public/design/design-config.json` with its own font and logo, and `?mode=dark` for dark mode.
- `http://127.0.0.1:5190/harness/`: the test harness. `http://127.0.0.1:5190/parity/`: the parity candidate.

**Without Node.js (Docker, including on Windows):** this command clones a branch into a temporary Node 24 container, installs and builds it there, and serves the examples. Replace `dev` with another branch name if needed. It works unchanged in PowerShell and in the Command Prompt.

```bash
docker run --rm -it -p 5190:5190 node:24-bookworm sh -c "git clone --depth 1 --branch dev https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console.git /app && cd /app && npm ci && npx vite --config examples/vite.config.ts --host 0.0.0.0"
```

Then open `http://localhost:5190/neutral/`. Stop with Ctrl+C; the container and its files are removed.

### The HTML file is generated

`console-kit.html` is built from the example source by `scripts/build-html.mjs` (standard [DIRECTIONS §4](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/8e3b818ece8dbb57f48a2dc779ee743fe441aba4/docs/DIRECTIONS.md#4-demo-html-file-and-docker)). Do not edit it by hand.
- **Two commits per change:** commit the source first, then run `npm run kit` and commit `console-kit.html` alone. The script refuses a working tree with uncommitted changes, so the source commit it embeds is exact.
- **Reproducible:** in a clean clone checked out at the embedded source commit, with Node 24, `npm ci && npm run kit` rebuilds a byte-identical file (same SHA-256). It contains no timestamp or machine path.
- **Offline by construction:** scripts, styles, fonts and images are inlined as `data:` URLs, and a Content-Security-Policy in the page allows nothing else (plus `blob:` for your own files). In the file, the screen, mode and configuration are kept in the URL hash instead of the query string.
- Published history is never rewritten: a correction adds a new source commit and a new generated commit.

## Checks

| Command | What it checks |
|---|---|
| `npm run check` | Type check |
| `npm test` | `scripts/check-dist.mjs` (no inter-repository dependency, imports limited to React, self-contained stylesheet, scoped selectors and prefixed global names, every component class defined, configuration files), `scripts/theme-tokens.mjs` (contrast of the shipped defaults only) and the Playwright suites: defaults (accessibility with axe, overflow, identity, keyboard, dialog, popover, reduced motion), navigation (Screen menu, state, keyboard exit at 320px), configuration, isolation, and the delivered HTML file opened from `file://` with the network cut (presentation page and six screens, light and dark, embedded resources and notices, no request, local files kept while navigating and selected again after a reload, keyboard exit at 320px, axe and reflow) |
| `npm run kit` | Builds `dist/` and the single HTML file `console-kit.html` from the committed source |
| `npm run consumer` | Clones this repository into an empty temporary folder, installs and checks it there, packs it, then builds and checks two neutral consumer apps (tarball and Git dependency) in Chromium |
| `npm run parity` | Visual parity with the frontend baselines; see [docs/PARITY.md](docs/PARITY.md) |

Playwright uses `CHROMIUM_PATH` when set.

## Design directions

General directions for WakoLab design systems live in the [standard repository](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard). That link is documentation only: this repository does not depend on it to build or run.

## Licence

MIT (see [LICENSE](LICENSE)) for original code and documentation, including the code adapted from the WakoLab frontend (WakoLab H3 decision; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)). Fonts, Tailwind CSS output and other third-party material keep their own licences and notices: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [licenses/](licenses/).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Agents also read [AGENTS.md](AGENTS.md) and [AGENTS-SYNC.md](AGENTS-SYNC.md).
