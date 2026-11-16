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
| registration | light | 360 | 360×1457 | 0 | 0 |  | 0 | 0 | 0 |
| registration | light | 768 | 768×1160 | 0 | 0 |  | 0 | 0 | 0 |
| registration | light | 1024 | 1024×900 | 0 | 0 |  | 0 | 0 | 0 |
| registration | light | 1440 | 1440×900 | 0 | 0 |  | 34 | 0 | 34 |
| registration | dark | 360 | 360×1457 | 0 | 0 |  | 0 | 0 | 0 |
| registration | dark | 768 | 768×1160 | 0 | 0 |  | 0 | 0 | 0 |
| registration | dark | 1024 | 1024×900 | 44 | 1 | 755,57–756,59: 4; 990,57–991,59: 4; 753,96–756,99: 6; 988,96–991,99: 6; 652,98–654,99: 4; 770,98–772,99: 4; 861,98–863,99: 3; 878,98–880,99: 4; 420,606–423,609: 9 | 44 | 0 | 0 |
| registration | dark | 1440 | 1440×900 | 0 | 0 |  | 0 | 0 | 0 |
