# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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

[0.1.0]: https://github.com/Ricky1800/leadbox/releases/tag/v0.1.0
