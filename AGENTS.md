# Agent instructions

These instructions are sufficient to work in this repository **without cloning any other repository**.

## Scope

This repository is the **Console** design system. It must stay **autonomous**: everything needed to build, test and use Console lives here. Do not add a dependency, submodule, script, path or instruction that requires another WakoLab or WakoLab-DesignSystems repository. If a component already exists elsewhere, copy it here and record its provenance (repository, path, commit) in the file or in a notice. Third-party packages are allowed and must be declared explicitly.

## Before you change anything

1. Read [README.md](README.md), [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS-SYNC.md](AGENTS-SYNC.md).
2. Inspect the current branch, open pull requests and the issue you work on. Preserve other people's work.
3. Work on a branch and open a pull request against `main`; do not merge, tag, release or change repository settings unless the issue explicitly authorizes it.

## Working rules

- **Configuration model.** Consumers set explicit light and dark colour values per role and reference their own font and logo files. Apply values exactly as written; omitted keys keep Console's defaults. Do not add colour derivation, contrast warnings, rejection or approval of consumer choices.
- **Defaults are verified.** Accessibility and contrast checks apply to Console's shipped defaults and examples.
- **Identity.** Keep Console's defaults recognisable (a terminal-inspired system: monospace interface type, dense rows with a 44px minimum height, a topbar plus rail shell from 64em, square geometry, flat surfaces and minimal motion); do not police what consumers change.
- **Product logic stays out.** No API calls, authentication, catalog or application routes; examples use synthetic data.
- The [standard repository](https://github.com/WakoLab-DesignSystems/wakolab-design-systems-standard) gives general directions. Linking to it is fine; depending on it is not.
- Keep provenance for copied code and assets, and keep third-party licences and notices. The repository's MIT licence does not relicense them.
- Distinguish verified facts, proposals and decisions. Never claim a check, release or behaviour you did not observe.
- Documentation, code comments and issues are in English.
- No secrets, personal data or private conversation content in commits or logs.

## Coordination

Record agent-to-agent messages in `.a2a/` following [AGENTS-SYNC.md](AGENTS-SYNC.md). Report each handoff in the related issue or pull request as well: Git does not notify anyone.
