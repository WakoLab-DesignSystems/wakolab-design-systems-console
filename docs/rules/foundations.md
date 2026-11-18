# Foundations

## Colour roles
- The common roles of the standard's CONFIGURATION §2: `bg`, `surface`, `surface-2`, `ink`, `muted`, `border`, `control`, `action`, `action-hover`, `action-pressed`, `on-action`, `link`, `focus`, `accent`, status pairs (`success`, `warning`, `danger`, `info` and their `-soft` grounds), `on-danger`, `scrim`, `shadow-card`, `shadow-pop`. Defaults per mode are in [config.default.json](../../config.default.json).
- Each omitted role keeps its own same-mode default; nothing follows another role. The only exception is `action-pressed`, which follows the effective `action-hover`.
- Independent roles: `link` and `focus` (light `#1d5c86` for both; dark link `#8ec5ee`, focus `#f0b35c`) do not follow `action`.
- `accent` (light `#8a4b0a`, dark `#f0b35c`) colours the keyboard prompt, the collection marker and the `›` shown on the focused row.
- Console declares no system-specific roles.

## Typography
- `ui` and `display`: JetBrains Mono, then ui-monospace, SFMono-Regular, Menlo, Consolas and the shared fallback (Noto Sans SC, Noto Sans Devanagari, system-ui, sans-serif).
- `prose`: DM Sans, then the shared fallback.
- `code`: JetBrains Mono, then ui-monospace and monospace; used by key hints (`.wl-kbd`).
- Interface text 14 px (`--wl-ui-size: 0.875rem`; mono reads larger), inputs 16 px. Headings weight 600, no tracking.

## Spacing, radius, elevation, density
- Radii: controls 4 px, cards 6 px, chips 4 px, covers 4 px.
- Elevation: `shadow-card` is `none` in both modes (flat surfaces); `shadow-pop` light `0 8px 24px rgb(28 30 27 / 0.14)`, dark `0 8px 28px rgb(0 0 0 / 0.5)`. Scrim light `rgb(28 30 27 / 0.45)`, dark `rgb(0 0 0 / 0.6)`.
- Row-height token 44 px; interactive controls at least 44 px high.
- The rail appears from 64em; the top bar is sticky.

## Focus
- 2 px outline in `focus`, offset 2 px; collection rows use an inset outline (offset −2 px) with the `›` marker.

## Icons
- Components keep icon slots; Console ships **no icon artwork** (provenance unresolved). Supply your own icon set (see the README). Below 40rem, header tools are icon-only, so a consumer without icons should prefer text buttons there (the example's Screen menu uses a Button for this reason).
