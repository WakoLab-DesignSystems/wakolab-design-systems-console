# Provenance: source → destination

Console was extracted for [#1](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/issues/1) following the standard repository at `6dc2a7a38cc35b34f737c49e79077b025e47ab6c` ([EXTRACTION_MATRIX](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/6dc2a7a38cc35b34f737c49e79077b025e47ab6c/docs/EXTRACTION_MATRIX.md), [CONFIGURATION](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/6dc2a7a38cc35b34f737c49e79077b025e47ab6c/docs/CONFIGURATION.md), [INDEPENDENCE_CHECK](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/6dc2a7a38cc35b34f737c49e79077b025e47ab6c/docs/INDEPENDENCE_CHECK.md)).

**Source:** WakoLab/wakolab-front at `e492bec9ced8893d6940879aa8186ac75a48a272`, read only. Nothing in the frontend was changed, and this repository does not depend on it to build, test or run. Each destination file repeats its source path and the changes made; this table is the overview. "Copied" means the code is the source's, with only the listed changes; "adapted" means the markup, class names and behaviour are kept while product inputs become props; "original" means new code for standalone use.

## Components (`src/components/`)

| Destination | Source | Kind | Changes for standalone use |
|---|---|---|---|
| `buttons.tsx` | `web/src/components/ui/buttons.tsx` | Copied | None |
| `fields.tsx` | `web/src/components/ui/fields.tsx` | Copied | None |
| `feedback.tsx` | `web/src/components/ui/feedback.tsx` | Copied | None |
| `search.tsx` | `web/src/components/ui/search.tsx` | Copied | None |
| `tabs.tsx` | `web/src/components/ui/tabs.tsx` | Copied | None |
| `confirm.tsx` | `web/src/components/ui/confirm.tsx` | Copied | None |
| `index.tsx` | `web/src/components/ui/index.tsx` | Copied | Dialog: the dead `backdrop:bg-panel/60` utility removed (E2); the effective `.wl-dialog::backdrop` scrim is unchanged |
| `popover.tsx` | `web/src/components/ui/popover.tsx` | Copied | Event and focus ownership (R3): Escape only for the innermost open popover holding focus; outside press closes without moving focus; listeners only while open |
| `icons.tsx` | `web/src/components/ui/icons.tsx` | Copied wrapper only | The `<svg>` element, its attributes and the icon names are kept; **the path data is not copied** (E4). Icons come from the consumer through `ConsoleRoot icons` |

## Parts (`src/parts/`)

| Destination | Source | Kind | Changes |
|---|---|---|---|
| `collection.tsx` | `web/src/features/catalog/parts.tsx` (CategoryChips, CategoryTree, Cover, ProjectLink, CatalogStatus, LoadMore) | Adapted | Renamed FilterChips, FilterTree, Cover, ItemLink, CollectionStatus, LoadMore; catalog view, i18n, routes and project contracts replaced by props |
| `page.tsx` | `web/src/features/catalog/project-parts.tsx` (Facts, MessageBlock, BackToProjects, ProjectLoading, ProjectProblem unavailable branch) | Adapted | Renamed KeyValueList, MessageBlock, BackLink, LoadingState, ProblemState; controller and i18n replaced by props |
| `shell.tsx` | `web/src/features/catalog/parts.tsx` (Brand "prompt", `.wl-tool` triggers, mode part of AppearanceMenu) | Adapted | Brand becomes LogoSlot (text fallback identical to the source; optional configured logo files); ToolButton and ModeMenu take labels as props |

## Compositions and root

| Destination | Source | Kind | Changes |
|---|---|---|---|
| `src/compositions/index.tsx` | `web/src/features/catalog/compositions/shells.tsx`, `shared.tsx`, `ConsoleHome.tsx`, `projects.tsx`; `web/src/features/catalog/pages.tsx` | Adapted | ConsoleHeader, ConsoleShell, Page, CollectionLayout/Section/Table, RowContent, DetailLayout/Section/Body, Panel, FormPage, MessagePage: same DOM, classes and order; content through slots and props |
| `src/compositions/registration.tsx` | `web/src/features/RegistrationShell.tsx` | Adapted (review S1 on #5) | RegistrationFrame: the content-free two-column frame (page heading, layout, editorial side, workspace with form column, status area, footnote) with the same DOM, classes and order; brand, appearance and language controls, editorial texts, flow logic and i18n are slots or stay in the frontend; `data-surface="dark"` (Folio only) dropped |
| `src/root/keyboard.ts` | `web/src/features/catalog/compositions/ConsoleHome.tsx` lines 30–45 | Adapted | `useCollectionKeys`: listener on the Console root by default; `scope: "page"` option; ignored while a modal dialog is open (N2) |
| `src/root/ConsoleRoot.tsx`, `context.ts` | Replace `web/src/theme/ThemeProvider.tsx` | Original | Root element `data-wds="console"` and `data-mode`; nothing written to `<html>` or `<body>`; optional persistence only with `storageKey`; configuration applied on the root |
| `src/root/config.ts`, `fonts.ts` | Standard CONFIGURATION and EXTRACTION_MATRIX §4 (R2) | Original | Configuration normalization with structural diagnostics only; internal font families per face set with reference counting |
| `src/index.ts` | — | Original | Package entry |

## Styles (`src/styles/`)

| Destination | Source | Kind | Changes |
|---|---|---|---|
| `tokens.css` | `design-system/themes.css` lines 2–80 (Console blocks) and the `:root` block of `design-system/theme.css` | Copied | Selector `[data-direction="console"]` → `[data-wds="console"]`; WakoLab `--wl-agent*` roles removed; default fonts renamed to internal aliases; `--wl-action-pressed` added (default: the effective action-hover); `--wl-font-display` written out as its own default stack instead of `var(--wl-font-ui)`, and `--wl-font-code` added with the stack the source hard-coded on `.wl-kbd`, so that each font role keeps its own default (review R2 on #5) |
| `theme.css` | `design-system/theme.css` | Copied | Imports moved to `console.css`; Folio literals, `--color-agent*` and the `[data-surface="dark"]` rule removed; `--color-brand-active` → `--wl-action-pressed` |
| `base.css` | `web/src/style.css` (base layer) | Copied | Font package imports replaced by the build's aliases |
| `console-parts.css` | `design-system/catalog.css` | Copied | Product and Folio/Marquee rules removed (source lines listed in the file); `.wl-kbd` uses `var(--wl-font-code)` |
| `registration.css` | `design-system/compositions.css` lines 2–28, 45–54, 98–100, 131–143 | Copied | Frame rules of RegistrationFrame; `[data-direction="console"]` prefixes dropped (the build scopes to the root); profile-page and Folio/Marquee rules not copied (review S1 on #5) |
| `global-rules.css` | `design-system/compositions.css` | Copied | Reduced-motion rule and Chinese/Hindi heading rules only |
| `root.css` | — | Original | Logo slot rules |
| `console.css` | Composition of `web/src/style.css` | Adapted | Entry for the build |

The build (`scripts/build.mjs`, original) prefixes every selector with the Console root, maps `:root`, `:host`, `html` and `body` to the root, and renames cascade layers, `@keyframes` and `@property` names with the `wds-console-` prefix (R1). `dist/css-audit.json` records the result.

## Not extracted

- **Product content** that the frontend composes into Console's slots (EXTRACTION_MATRIX §6): JoinPanel, Access, membership, repositories, tools, rewards, registration and profile content, catalog contracts, API ports, i18n catalogs, the appearance preference key, the `agent`/`human` identity colours, the prototype and product tests.
- **Registration content and flow**: the frame is extracted (RegistrationFrame, above); the registration screens, texts, brand, appearance and language controls and the flow logic stay in the frontend.
- **Appearance, language and account menus** as product components: only their trigger markup (ToolButton) and the mode part (ModeMenu) are extracted; theme lists, locales and account logic stay in the frontend.
- **The cross-direction review gallery** and its CSS.
- **Icon artwork** (E4): blocked until its provenance is resolved.

## Examples and checks (original)

`examples/neutral` (neutral demonstration), `examples/harness` (test harness), `examples/parity` (parity candidate; its synthetic texts in `examples/parity/fixtures.ts` are copied from what the frontend prototype renders, with their source noted in the file), `examples/parity/fixture` (one parity fixture for a form, the components, a confirmation dialog and the registration frame, rendered with Console or, through `examples/parity/front-baseline`, with the frontend's own modules from a separate read-only checkout; `fixture.css` holds host rules and Tailwind utilities copied from the baseline build for slot content), `tests/*.spec.ts`, `scripts/check-dist.mjs`, `scripts/theme-tokens.mjs` (contrast check adapted from the frontend's token check), `scripts/check-artwork.mjs` (with `scripts/excluded-icon-hashes.json`: one-way hashes of the excluded icon path data, not the data), `scripts/external-consumer.mjs`, `scripts/parity.mjs`.

## Offline HTML kit ([#8](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/issues/8))

Following the integrated kit standard at `8e3b818ece8dbb57f48a2dc779ee743fe441aba4` (DIRECTIONS §2 and §4, KIT_PROPOSAL §2), from `dev` at `4546c4a86919c6c3ab9c621501e553e00d1daa3e` (the six-screen menu of #7).

| Destination | Source | Kind | Changes |
|---|---|---|---|
| `scripts/build-html.mjs` | WakoLab-DesignSystems/wakolab-design-systems-folio at `a45832769d41ec10c1c6e0dc6afa8f1c1061f99a` (folio PR #7, under review), same path | Copied | Console names, example root `examples/neutral`, output `console-kit.html` |
| `examples/neutral/env/http.ts`, `offline.ts`, `shared.ts` | Folio at `a458327`, `examples/demo/env/` | Copied | Console names and example paths; `stateIn`: the query string over HTTP (as integrated in #7), the URL hash in the offline file |
| `examples/neutral/main.tsx`: `LocalConfig`, local-file state | Folio at `a458327`, `examples/demo/main.tsx` | Copied | Wired to the example's query/hash navigation |
| `examples/neutral/main.tsx`: Overview page, Licences section, state in query or hash | — | Original | The Licences section also embeds Console's own `LICENSE` (Revex's H-R1 on folio#7, applied here) |
| `examples/neutral/example.css`: `ex-local`, `ex-file`, `ex-licence`, `ex-swatch*` | Folio at `a458327`, `examples/demo/demo.css` | Copied | `ex-` names |
| `tests/kit-html.spec.ts` | Folio at `a458327`, same path | Copied | Console menu and values; added: notices and LICENSE in the file, keyboard exit at 320px |
| `docs/rules/` | — | Original | From Console's extracted styles and compositions |
| `console-kit.html` | Generated by `scripts/build-html.mjs` | Generated | Embeds the source commit and the standard commit; inlines the default fonts, Tailwind output, the example configuration with its font and synthetic logos, and React, React DOM and Scheduler (MIT, [licenses/react-MIT.txt](../licenses/react-MIT.txt)) |
| `docs/screenshots/kit-*.png` | Captured from `console-kit.html` | Generated | No icon artwork: Console ships none |
