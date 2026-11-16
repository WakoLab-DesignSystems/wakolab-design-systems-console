# Visual parity report

```json
{
  "prototypeBaseline": "http://127.0.0.1:5174/prototype/index.html",
  "prototypeCandidate": "http://127.0.0.1:5190/parity/index.html",
  "fixtureBaseline": "http://127.0.0.1:5175/index.html",
  "fixtureCandidate": "http://127.0.0.1:5190/parity/fixture/index.html",
  "browser": "Chromium 153.0.8010.12",
  "playwright": "1.56.1",
  "viewportHeight": 900,
  "deviceScaleFactor": 1,
  "reducedMotion": "reduce",
  "fullPage": true,
  "animations": "disabled",
  "control": "second browser launch, same settings",
  "icons": "injected into candidates at run time from the frontend checkout (25 names)"
}
```

| Screen | Mode | Width | Sizes | Differing pixels | Max delta | Clusters (x0,y0–x1,y1: pixels) | Base vs base | Cand vs cand | 2nd launch |
|---|---|---|---|---|---|---|---|---|---|
| overlays | light | 360 | 360×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | light | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | light | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | light | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | dark | 360 | 360×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | dark | 768 | 768×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | dark | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| overlays | dark | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
