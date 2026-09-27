# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-09-27

### Added

- Seven built-in visual theme presets (`default`, `salon`, `trades`,
  `restaurant`, `clinic`, `auto`, `professional`), selectable via
  `data-theme="<name>"` or `LeadBox.init({ theme: '<name>' })`. Each preset
  is a coherent token set (accent/ink/background/border/error/success
  colors, dialog + input corner radius, font stack, button/trigger
  shadows) — see `src/themes.js`.
- Automatic light/dark mode: follows the visitor's OS-level
  `prefers-color-scheme` by default, with `data-color-scheme` /
  `colorScheme: 'light'|'dark'|'auto'` to force one mode.
- `accentColor` (`data-accent-color`) is now a single-token override on
  top of whichever theme is active, instead of always winning over theme
  colors.
- `demo/themes.html` — a live gallery of every theme (light + dark), with
  a working submit flow per card so you can see the new success-check
  animation in each one.
- Advanced named exports (`LeadBoxWidget`, `mergeConfig`, `normalizeConfig`,
  `DEFAULTS`, `THEMES`, `THEME_NAMES`) from the ESM build, for pages that
  want to mount more than one independent widget instance.
- Success state now shows an animated checkmark (SVG stroke-draw,
  gated behind `prefers-reduced-motion: no-preference` like the rest of
  the widget's motion) plus a heading, above the existing message and
  booking/call links.

### Changed

- Visual polish pass across the dialog: consistent spacing rhythm,
  clearer focus-visible rings, an error background tint on the
  form-level error banner, hover/active states on buttons and links, and
  a refined mobile bottom-sheet layout (drag-handle affordance, safe-area
  aware corner rounding).
- `dist/leadbox.min.js` grew from ~6.5 KB to ~8.4 KB gzipped to fit the
  theme system; still comfortably under the 10 KB budget enforced by
  `npm run size`.

## [0.1.0] - 2026-09-26

### Added

- Initial release: embeddable "Get a Free Quote" widget.
- Floating trigger button + accessible modal dialog (Shadow DOM, focus
  trap, Esc-to-close, `aria-*` attributes, `prefers-reduced-motion`
  support).
- Configurable fields: name, phone, email, message, service (select),
  preferred contact method — via `data-*` attributes and/or
  `LeadBox.init()`.
- Client-side validation (required fields, email/phone format) with
  accessible inline error messages.
- Spam mitigation: honeypot field + minimum time-to-submit check.
- Automatic capture of page URL, referrer, and UTM parameters (no
  cookies, no tracking).
- JSON or `application/x-www-form-urlencoded` submission encoding, with
  retry-safe error handling for network failures and non-2xx responses.
- `leadbox:submit` / `leadbox:success` / `leadbox:error` events.
- Public API: `LeadBox.init()`, `.open()`, `.close()`, `.destroy()`,
  `.getInstance()`.
- `dist/leadbox.min.js` (IIFE, auto-init from a `<script>` tag) and
  `dist/leadbox.esm.js` builds, both under the 10 KB gzip size budget.
- Google Apps Script receiver (`examples/google-sheets-receiver.gs`) +
  setup guide for a free Google Sheets backend.
- Docs for Formspree and Zapier/Make backends, and embed guides for
  WordPress, Wix, Squarespace, and Shopify.
- Demo page (`demo/index.html`) for GitHub Pages, using a mocked fetch
  endpoint.
- Vitest test suite covering config parsing, validation, spam checks,
  submission encoding, UTM capture, focus trap/Esc behavior, and events.
- GitHub Actions CI (lint, typecheck, test, build, size budget).

[0.2.0]: https://github.com/Ricky1800/leadbox/releases/tag/v0.2.0
[0.1.0]: https://github.com/Ricky1800/leadbox/releases/tag/v0.1.0
