# wakolab-design-systems-console
Console: a terminal-inspired design system with compact layouts, monospace typography, and configurable light/dark colors, fonts and logos.

## Status

Bootstrap only: **no design-system code has been extracted yet.** Extraction from the WakoLab frontend is planned in [#1](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-console/issues/1), following the [extraction matrix](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard/blob/main/docs/EXTRACTION_MATRIX.md). Until then, nothing here is ready to install.

## About Console

Console is a terminal-inspired system: monospace interface type, dense rows with a 44px minimum height, a topbar plus rail shell from 64em, square geometry, flat surfaces and minimal motion. Default fonts: JetBrains Mono, DM Sans, Noto Sans SC, Noto Sans Devanagari (each under its own licence).

## Independent use

This repository is **self-contained**. Once extracted, it will be usable by cloning only this repository into any project:
- it needs no other WakoLab or WakoLab-DesignSystems repository, submodule or sibling checkout;
- every component it needs is a local copy, with its provenance noted;
- third-party tools and frameworks (for example React, Tailwind CSS or font packages) will be declared explicitly in this repository.

## Configuration (planned)

Consumers set **explicit light and dark colour values** per role and point to **their own font and logo files**. Every customization key is optional and is used exactly as written; omitted keys keep Console's defaults. There is no colour derivation, and consumer choices are not judged or approved. The project verifies its own shipped defaults.

## Design directions

General directions for WakoLab design systems live in the [standard repository](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard). That link is documentation only: this repository does not depend on it to build or run.

## Licence

MIT (see [LICENSE](LICENSE)) for original code and documentation. Fonts and other third-party resources keep their own licences and notices.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Agents also read [AGENTS.md](AGENTS.md) and [AGENTS-SYNC.md](AGENTS-SYNC.md).
