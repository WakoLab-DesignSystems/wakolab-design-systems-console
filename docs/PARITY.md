# Visual parity with the frontend (EXTRACTION_MATRIX §8)

This records the visual parity check run for [#1](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/issues/1). It is evidence for review, not an acceptance decision.

## Method

- **Baseline:** the Console screens of the review prototype of WakoLab/wakolab-front at `e492bec9ced8893d6940879aa8186ac75a48a272`, built read-only from a separate checkout (`vite.prototype.config.ts`) and served locally. Prototype settings: frame mode, English, signed out, MVP variant, Console direction, light or dark.
- **Candidate:** `examples/parity`, which renders the same synthetic texts (`examples/parity/fixtures.ts`, source noted in the file) with the built package (`dist/`).
- **Script:** `scripts/parity.mjs` (capture settings in its header). Viewports 360, 768, 1024 and 1440 px wide (900 px high, full-page capture), device scale factor 1, reduced motion emulated, `document.fonts.ready` awaited, animations disabled, caret hidden. Both sides use the same Chromium (153.0.8010.12, the environment's pre-installed browser driven by Playwright 1.56.1) and the same font files.
- **Icons:** icon path data is not in this repository (E4). For the comparison only, the script reads the frontend's `web/src/components/ui/icons.tsx` from the separate checkout and injects it into the candidate page at run time; nothing from it is written here.
- **Product content in slots:** the detail page's side panel holds the frontend's JoinPanel and Access content, which stay in the frontend (§6). The candidate supplies that markup and its five rules in `examples/parity/parity.css` (copied from `design-system/catalog.css`, lines noted), as the frontend would; they are not part of the package.

## Screens compared

Collection, detail, not-found message, a message page framed as a form page (the "propose" page of the MVP; the signed-out MVP has no form page in Console), loading, catalog problem state (unavailable), and an open modal dialog (session expired) over the collection.

**Not compared:** the frontend's components gallery. It is a cross-direction review page served only by the frontend's development server, not a Console screen, so it has no Console counterpart here; the package's own components are covered by `tests/defaults.spec.ts` and the neutral example.

## Result

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

With the frontend prototype at `e492bec` served on `http://127.0.0.1:5174/prototype/index.html`:

```bash
node scripts/parity.mjs --icons <frontend checkout>/web/src/components/ui/icons.tsx
```

The script writes `parity-output/` (ignored by Git): baseline, candidate, diff and side-by-side images for each case, plus `report.json` and `report.md`. The images are not committed because they contain the frontend's icon artwork, whose provenance is unresolved.
