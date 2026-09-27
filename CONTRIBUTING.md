# Contributing to LeadBox

Thanks for considering a contribution! LeadBox is intentionally small,
dependency-free, and focused — please keep that in mind when proposing
changes.

## Ground rules

- **Zero runtime dependencies.** `package.json` `dependencies` should stay
  empty. Everything the widget does at runtime is hand-written.
- **Size budget.** `dist/leadbox.min.js` must stay under 10 KB gzipped
  (`npm run size` enforces this in CI). If a change grows the bundle
  meaningfully, explain why in the PR description.
- **Plain JS + JSDoc, not TypeScript source.** Files use `// @ts-check`
  and JSDoc type annotations; `npm run typecheck` runs `tsc --noEmit`
  against `src/` using those annotations. Don't add a `.ts` file or a
  build-time type-stripping step.
- **Accessibility is not optional.** Any change to the dialog/form UI
  needs to preserve (or improve) the existing focus trap, `aria-*`
  attributes, and keyboard behavior. If you're not sure, say so in the PR
  and it'll get reviewed with that in mind.
- **No new tracking.** LeadBox sets no cookies and does no fingerprinting;
  changes that add either will be declined.

## Getting started

```bash
git clone https://github.com/Ricky1800/leadbox.git
cd leadbox
npm install
npm run check   # lint, typecheck, test, build, size — all in one
```

## Before opening a PR

Run the full check suite and make sure it's green:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run size
```

If your change touches `src/`, run `npm run build` and commit the
resulting `dist/leadbox.min.js` / `dist/leadbox.esm.js` — CI fails if
`dist/` doesn't match a fresh build from source.

## Commit style

This repo uses [Conventional Commits](https://www.conventionalcommits.org/)
(`feat:`, `fix:`, `docs:`, `build:`, `ci:`, `test:`, `refactor:`, `chore:`).
Keep commits focused — one logical change per commit — and make sure each
one leaves the repo in a working state (tests passing, nothing half-done).

## Adding a field, backend doc, or platform guide

- A new **field type** (e.g. a date picker) belongs in `src/dialog.js`
  (rendering), `src/validate.js` (if it needs validation), and
  `src/config.js` (the `VALID_FIELDS` list) — plus tests for each.
- A new **backend doc** (another form/webhook service) goes in `docs/`,
  following the structure of `docs/formspree.md` or
  `docs/zapier-make.md`.
- A new **platform embed guide** goes in `docs/`, following the structure
  of `docs/wordpress.md`.

## Reporting bugs / requesting features

Please use the issue templates (Bug report / Feature request) — they ask
for the specific details (repro steps, browser, config) that make an issue
actionable quickly. Check [ROADMAP_ISSUES.md](ROADMAP_ISSUES.md) first in
case what you want is already planned.

## Code of conduct

Be respectful and constructive. This is a small project maintained in
spare time — patience with review turnaround is appreciated.
