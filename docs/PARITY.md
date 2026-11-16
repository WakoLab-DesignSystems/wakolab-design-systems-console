# Visual parity with the frontend (EXTRACTION_MATRIX §8)

Evidence for review of [#1](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/issues/1) / [#5](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/pull/5); not an acceptance decision. **The strict gate (§8.5: no difference except listed deliberate ones) does not pass**, and the script still reports every nonzero pixel as a failure. Orc accepted a **bounded, candidate-specific exception** for the enumerated prototype corner clusters recorded in run 2, at their recorded locations and per-case values (at most 22 pixels and 7/255 per channel in a case), with cause unknown ([decision 6905009977](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/pull/5#issuecomment-6905009977)); Revex confirmed the localization in the committed crops ([review 5914155539](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/pull/5#pullrequestreview-5914155539)). The exception is not a general allowance: no threshold was raised, and it does not extend to other pixels, other cases, missing coverage, icons or configuration. Coverage is what is listed below, not exhaustive.

> **Correction note (D1, after review 5914155539).** The run 2 account published at `1966fa6` overgeneralized two points, here corrected in place (the earlier wording stays in Git history at that commit):
> 1. It said all **17** prototype cases were identical in the second launch with zero self-controls. In fact **16** are; **dialog / light / 1440** gave **12** then **18** differing pixels, with a baseline self-control of **6** (candidate self-control 0).
> 2. It said both nonzero registration cells "vanish in the second launch". In fact **registration / light / 1440** gave **0** then **34** (baseline self-control 34) and **registration / dark / 1024** gave **44** then **0** (baseline self-control 44); candidate self-controls are 0.
> It also described the component sheet as "every exported primitive in its states"; the actual coverage is listed under run 2 and run 3. Raw data are unchanged.

## Run 2 — Des, after review R4 (correction delta on #5)

- **Code:** package built from the sources of `78a9db87133309dac2afe41127850b9f0e44fc90` (later commits change only the parity fixture's slot content, tests and documentation, not `src/` or `dist/`).
- **Environment:** the same pinned capture settings as `scripts/parity.mjs` describes; Chromium 153.0.8010.12 (the environment's pre-installed browser) driven by Playwright 1.56.1, for baseline and candidate alike. Revex's independent checks used Chromium 155.0.8059.79; this run was not repeated in that browser.
- **Baselines** (frontend at `e492bec`, read only, separate checkout; nothing written into it):
  - prototype screens: the review prototype, as in run 1;
  - fixture screens (new): `examples/parity/fixture`, rendered with the frontend's own modules through `examples/parity/front-baseline` — its `components/ui` index, its ThemeProvider and stylesheet, the `.wl-form-page` framing of `pages.tsx`, and its real `RegistrationShell`.
- **Candidates:** `examples/parity` (prototype screens) and the same fixture rendered with the built package (`console-sys.tsx`).
- **New screens:** a real neutral form (`form`: text fields with hint and error, select, textarea, choice group, checkbox, alert, buttons, in the `.wl-form-page` framing); the component sheet (`components`: buttons in four variants, two sizes, busy and disabled, an icon button; text field with hint and with error, code field, select, choice group, checkbox, search field with a value; pressed and unpressed toggle chips, badge; alerts in four tones, card, stepper, connection row, tabs with a panel, empty state, skeletons — each in the static state shown, not hover, focus or pressed states); an open destructive confirmation dialog (`confirm`); the content-free registration frame (`registration`, S1).
- **Localization:** every differing pixel is listed with both colours in `docs/parity/run-2/differences/<case>.json`, grouped into clusters; each cluster has an 8× crop (baseline | candidate | difference) in `docs/parity/run-2/evidence/`. Areas covered by an icon `<svg>` on either side are masked grey in crops; **in this run no crop intersected an icon, so nothing was masked**. Full-page images are not committed (they contain the frontend's icon artwork).
- **Controls:** `--control` captured every case again in a second, separate browser launch: baseline vs baseline, candidate vs candidate, and the comparison again.
- **Capture change:** native `<select>` controls are laid out again after `document.fonts.ready`, on both sides. Without it, a select's text sat 1 px off depending on whether its first layout happened before the web font loaded: the same page differed from itself by 968 pixels, and baseline vs candidate gave 0 or 982 pixels depending on the launch. This aligns capture timing; it changes no threshold.

### Result

88 comparisons (11 screens × 4 widths × 2 modes). Page sizes are equal in all of them. Cells: differing pixels (largest per-channel difference out of 255). The registration row is from the targeted rerun (below).

| Screen | Light 360 | Light 768 | Light 1024 | Light 1440 | Dark 360 | Dark 768 | Dark 1024 | Dark 1440 |
|---|---|---|---|---|---|---|---|---|
| collection | 0 | 0 | 0 | 0 | 0 | 0 | 18 (≤5) | 17 (≤5) |
| detail | 0 | 0 | 0 | 0 | 0 | 0 | 18 (≤5) | 10 (≤5) |
| notFound | 0 | 0 | 0 | 0 | 8 (≤1) | 0 | 0 | 0 |
| message | 0 | 0 | 0 | 0 | 8 (≤1) | 0 | 0 | 0 |
| loading | 0 | 0 | 0 | 0 | 22 (≤7) | 8 (≤1) | 0 | 0 |
| unavailable | 0 | 8 (≤1) | 0 | 0 | 22 (≤7) | 8 (≤1) | 10 (≤5) | 10 (≤5) |
| dialog | 0 | 0 | 17 (≤4) | 12 (≤4)¹ | 0 | 0 | 13 (≤2) | 14 (≤2) |
| form | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| components | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| confirm | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| registration | 0 | 0 | 0 | 0² | 0 | 0 | 44 (≤1)² | 0 |

¹ First launch 12, second launch 18; baseline vs baseline across launches 6, candidate vs candidate 0. ² Registration (targeted rerun): light / 1440 is 0 in the first launch and 34 in the second, baseline self-control 34; dark / 1024 is 44 in the first launch and 0 in the second, baseline self-control 44; candidate self-controls 0.

**Form, components, confirmation dialog and registration frame:** 31 of 32 comparisons are pixel-identical in the first launch, and 31 of 32 in the second. The two registration cells that differ (one in each launch, at most 1/255) come with the same count of baseline-versus-baseline differences and a zero candidate self-control, which supports variability on the baseline side; they do not both disappear in the second launch (see ²).

**Prototype screens, 17 cases with differences:** 8 to 22 pixels per case, at most 7/255, none above 16/255. **16 cases** give the same count in the second launch with baseline and candidate self-controls at 0, so they are **not capture noise**. **dialog / light / 1440** varies (12 then 18, baseline self-control 6; see ¹). Localization: anti-aliased corner pixels of rounded borders only — the `/` key hint in the top bar (two clusters of 4–6 pixels at its top corners at 1024 and 1440 px), the search field and filter/tool button corners at the left edge or right side at 360 and 768 px, and one corner of a side panel or table frame (4–8 pixels). Mostly in dark mode; the dialog cases also in light mode. Computed styles and sub-pixel geometry of these elements are identical on both sides except the internal names of the same font files. Three context hypotheses were tested and **excluded**: `color-scheme: dark` on `<html>` (the baseline sets it there; Console only on its root), the body background versus the root background, and `color-scheme` on the root element; the extra fixed live region and closed dialog in the baseline page were excluded in run 1. **Cause not identified**; no further investigation was done, as instructed. **Disposition:** bounded exception by Orc for these recorded clusters only, confirmed by Revex (see the top of this page).

**Superseded first registration pass:** in the main run the registration row showed up to 380 pixels (≤203/255) in dark mode. Cause: an error in the candidate's slot content (the appearance select was fixed to "Light", while the frontend's RegistrationShell shows the current mode). The fixture was corrected and only the 8 registration cases were captured again (`docs/parity/run-2/registration-rerun/`). The main run's `report.json` and `report.md` still contain the superseded registration rows; their crops were not kept.

### Files

- `docs/parity/run-2/report.json`, `report.md`: all 88 cases of the main run, with clusters and control columns.
- `docs/parity/run-2/differences/*.json`: per-pixel localization for every prototype case with differences.
- `docs/parity/run-2/evidence/*.png`: 8× crops of each cluster.
- `docs/parity/run-2/registration-rerun/`: report, localization and crops of the corrected registration cases.

## Run 3 — Des, targeted R4-C capture (open popover, visible toast)

Requested by review 5914155539 (R4-C) and Orc's [disposition 6905088342](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/pull/5#issuecomment-6905088342). Only these states were captured; the 88 run-2 cases were not rerun and the accepted corners were not investigated further.

- **Screen `overlays`** in the existing fixture: a `.wl-tool` trigger with an **open Popover** (heading, three options, the first with a check icon) and a **visible Toast**, on one page. Baseline: the frontend's own `Popover` and `Toast` at `e492bec`; candidate: the package's. The popover is opened by the same scripted click on both sides after fonts load; the toast is shown from the first render with a timeout far longer than the capture. Same settings as run 2: 360/768/1024/1440 px, light and dark, Chromium 153.0.8010.12, Playwright 1.56.1, second-launch controls. Package sources unchanged since `78a9db8` (no `src/` change in this delta).
- **Result: 8 of 8 pixel-identical** in the first and second launches; baseline and candidate self-controls 0; equal page sizes. No crop exists because no pixel differs. Report: `docs/parity/run-3/report.json`, `report.md`.
- **Superseded first R4-C pass (script error, not committed as evidence):** the first capture applied the opening click to the baseline only (the scripted action had been written for the prototype dialog, which the candidate renders open itself), so the candidate's popover was closed: 82,124 to 96,652 differing pixels in one cluster around the popover, toast identical. `scripts/parity.mjs` now applies interactions to both sides (the prototype dialog keeps its baseline-only opening), and the 8 cases were captured again. No earlier case used such an interaction, so run 2 is unaffected.
- **Not covered visually:** hover, focus and pressed states, popover alignment to the end, other overlay contents, and Console parts outside the screens listed in runs 2 and 3.

## Run 1 — Des, candidate `396dabd` (kept as reported)

Reported in PR #5 at HEAD `396dabddc61d8a0b1ec461a7101b85ac2c6ed33f`; reviewed by Revex in [review 5913970778](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/pull/5#pullrequestreview-5913970778), which did not rerun it. Run 2 corrects one statement of run 1: the differences said there to be "not stable across browser launches" were, for these prototype cases, stable across launches in run 2's controls; the variation seen in run 1 matches the baseline-side variation now measured for two cases.


### Method

- **Baseline:** the Console screens of the review prototype of WakoLab/wakolab-front at `e492bec9ced8893d6940879aa8186ac75a48a272`, built read-only from a separate checkout (`vite.prototype.config.ts`) and served locally. Prototype settings: frame mode, English, signed out, MVP variant, Console direction, light or dark.
- **Candidate:** `examples/parity`, which renders the same synthetic texts (`examples/parity/fixtures.ts`, source noted in the file) with the built package (`dist/`).
- **Script:** `scripts/parity.mjs` (capture settings in its header). Viewports 360, 768, 1024 and 1440 px wide (900 px high, full-page capture), device scale factor 1, reduced motion emulated, `document.fonts.ready` awaited, animations disabled, caret hidden. Both sides use the same Chromium (153.0.8010.12, the environment's pre-installed browser driven by Playwright 1.56.1) and the same font files.
- **Icons:** icon path data is not in this repository (E4). For the comparison only, the script reads the frontend's `web/src/components/ui/icons.tsx` from the separate checkout and injects it into the candidate page at run time; nothing from it is written here.
- **Product content in slots:** the detail page's side panel holds the frontend's JoinPanel and Access content, which stay in the frontend (§6). The candidate supplies that markup and its five rules in `examples/parity/parity.css` (copied from `design-system/catalog.css`, lines noted), as the frontend would; they are not part of the package.

### Screens compared

Collection, detail, not-found message, a message page framed as a form page (the "propose" page of the MVP; the signed-out MVP has no form page in Console), loading, catalog problem state (unavailable), and an open modal dialog (session expired) over the collection.

**Not compared:** the frontend's components gallery. It is a cross-direction review page served only by the frontend's development server, not a Console screen, so it has no Console counterpart here; the package's own components are covered by `tests/defaults.spec.ts` and the neutral example.

### Result

56 comparisons. Page sizes are equal in all of them. Cells give the number of pixels that differ, then the largest per-channel difference (out of 255):

| Screen | Light 360 | Light 768 | Light 1024 | Light 1440 | Dark 360 | Dark 768 | Dark 1024 | Dark 1440 |
|---|---|---|---|---|---|---|---|---|
| collection | 0 | 0 | 0 | 0 | 0 | 0 | 18 (≤5) | 17 (≤5) |
| detail | 0 | 0 | 0 | 0 | 0 | 0 | 18 (≤5) | 10 (≤5) |
| notFound | 0 | 0 | 0 | 0 | 8 (≤1) | 0 | 0 | 0 |
| message | 0 | 0 | 0 | 0 | 8 (≤1) | 0 | 0 | 0 |
| loading | 0 | 0 | 0 | 0 | 22 (≤7) | 8 (≤1) | 0 | 0 |
| unavailable | 0 | 8 (≤1) | 0 | 0 | 22 (≤7) | 8 (≤1) | 10 (≤5) | 10 (≤5) |
| dialog | 0 | 0 | 17 (≤4) | 18 (≤4) | 0 | 0 | 13 (≤2) | 14 (≤2) |

- **39 of 56** are pixel-identical.
- **17 of 56** differ in 8 to 22 pixels each, all with a per-channel difference of at most 7/255; no pixel differs by more than 16/255.
- The differing pixels are anti-aliased corner pixels of rounded borders in the top bar (the `/` key hint, the search field and the tool buttons). The computed styles of these elements are identical on both sides, except the internal names of the same font files.
- The differences are not stable across browser launches: in a separate browser launch, the `collection` screen, dark, 1440 px matched exactly, and repeated runs gave 18, 6 and 12 differing pixels for `dialog`, light, 1440 px. They are reported here as observed, not explained away.

Deliberate differences: none. Strictly, §8.5 asks for no difference; the reviewer decides whether these sub-perceptual corner pixels are acceptable or need further work.

### Reproduce (run 1, as reported)

```bash
npm ci
```

```bash
npm run build
```

```bash
npx vite --config examples/vite.config.ts
```

With the frontend prototype at `e492bec` served on `http://127.0.0.1:5174/prototype/index.html`:

```bash
node scripts/parity.mjs --icons <frontend checkout>/web/src/components/ui/icons.tsx
```

The script writes `parity-output/` (ignored by Git): baseline, candidate, diff and side-by-side images for each case, plus `report.json` and `report.md`. The images are not committed because they contain the frontend's icon artwork, whose provenance is unresolved.

## Reproduce

```bash
npm ci
```

```bash
npm run build
```

```bash
npx vite --config examples/vite.config.ts
```

With the frontend prototype at `e492bec` served on `http://127.0.0.1:5174/prototype/index.html`, and the fixture baseline built from the same checkout and served on `http://127.0.0.1:5175/index.html`:

```bash
FRONT=<frontend checkout> OUT=<folder> node <frontend checkout>/node_modules/vite/bin/vite.js build --config examples/parity/front-baseline/vite.config.mjs
```

```bash
node scripts/parity.mjs --control --icons <frontend checkout>/web/src/components/ui/icons.tsx
```

The script writes `parity-output/` (ignored by Git).
