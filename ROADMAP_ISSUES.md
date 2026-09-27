# Roadmap / future issues

These are scoped so each one can be copy-pasted directly into a new GitHub
issue. They're ordered roughly by how self-contained/beginner-friendly they
are, not by priority.

---

## 1. Add i18n-ready locale packs (Spanish, and a documented pattern for more)

**Labels:** `good first issue`, `help wanted`, `enhancement`

**Body:**

`src/locale.js` already centralizes every UI string behind a single
`DEFAULT_LOCALE` object, and `data-locale-<key>` / `locale: {...}` already
let a site owner override individual strings. This issue is about shipping
a ready-made Spanish locale (`src/locales/es.js`) and documenting the
pattern so contributors can add more languages without touching widget
logic.

**Acceptance criteria:**

- [ ] `src/locales/es.js` exports a complete `LeadBoxLocale` object (every
      key from `src/locale.js`, translated).
- [ ] A documented way to select it, e.g. `data-locale-preset="es"` or
      `LeadBox.init({ locale: esLocale })`.
- [ ] `docs/i18n.md` explaining how to add another language (copy
      `src/locale.js`'s shape, translate every key, wire it up the same
      way).
- [ ] Tests confirming the Spanish preset overrides every string with no
      leftover English fallback.
- [ ] No bundle-size regression for consumers who don't opt into a
      non-English locale (i.e. locale packs shouldn't be bundled by
      default — document how to include one).

---

## 2. Multi-step form support

**Labels:** `enhancement`, `help wanted`

**Body:**

Right now all configured fields render on a single screen. For businesses
with more fields (e.g. address + project details + preferred contact),
a two-step form ("Contact info" -> "Project details") could reduce
abandonment. This should stay optional and backward-compatible.

**Acceptance criteria:**

- [ ] New config option, e.g. `steps: [['name','phone'], ['service',
      'message','preferredContact']]`, that splits `fields` into screens.
- [ ] Back/Next buttons, with focus moved to the first field of the new
      step (and the h2 announced via `aria-live` or refocus, for screen
      readers).
- [ ] Per-step validation (Next is blocked until the current step's
      required fields are valid).
- [ ] Progress indicator (e.g. "Step 1 of 2") exposed accessibly.
- [ ] Existing single-step behavior is the default when `steps` isn't set
      — no breaking change for current users.
- [ ] Tests for step navigation, validation gating, and focus management.

---

## 3. File upload field

**Labels:** `enhancement`, `help wanted`

**Body:**

Some leads (e.g. "here's a photo of the leak") are much more useful with
an attached image. Add an optional `file` field type.

**Acceptance criteria:**

- [ ] New field key `photo` (or similar) addable via `data-fields`.
- [ ] Client-side constraints: max file size (configurable, sensible
      default e.g. 5MB) and accepted types (default: common image types),
      with an accessible error message when violated.
- [ ] Since the two built-in encodings (JSON/form-urlencoded) can't carry
      binary data, document how this field is sent — most likely as a
      base64 string in the JSON payload, with a clear size-budget warning,
      since Apps Script/Formspree/Zapier all have their own payload size
      limits.
- [ ] Update `examples/google-sheets-receiver.gs` (or add a variant) to
      show saving the file into Google Drive and linking it from the
      Sheet row.
- [ ] This should be opt-in and not affect the size budget for consumers
      who don't use it.

---

## 4. reCAPTCHA / hCaptcha adapter (opt-in)

**Labels:** `enhancement`, `security`

**Body:**

The honeypot + timing checks catch naive bots, but a business getting
targeted by more sophisticated spam may want a real challenge. This should
be a thin, optional adapter — not a default dependency.

**Acceptance criteria:**

- [ ] New optional config, e.g. `captcha: { provider: 'hcaptcha', siteKey:
      '...' }`.
- [ ] When set, the relevant provider script is loaded lazily (only if
      configured) and a token is attached to the payload for server-side
      verification.
- [ ] Documented server-side verification snippet for at least the Google
      Sheets (Apps Script) receiver.
- [ ] Zero impact (no extra script load, no size increase) when `captcha`
      is not configured.
- [ ] Tests for the payload shape when a (mocked) captcha token is
      present.

---

## 5. Airtable backend guide

**Labels:** `documentation`, `good first issue`

**Body:**

Some small businesses already use Airtable as a lightweight CRM. Document
how to receive LeadBox submissions into an Airtable base, similar in
structure to `docs/google-sheets.md`.

**Acceptance criteria:**

- [ ] `docs/airtable.md` covering: creating a base/table with matching
      columns, generating a personal access token, and either (a) a small
      serverless function (since Airtable's API doesn't accept
      form-urlencoded/CORS browser requests well) or (b) a documented
      Zapier/Make bridge (linking to `docs/zapier-make.md`) as the
      pragmatic default.
- [ ] Linked from the README's Backends section.

---

## 6. Dark-mode-aware default theme

**Labels:** `enhancement`, `good first issue`

**Body:**

The widget currently ships one light theme (overridable via CSS custom
properties). Add an automatic dark variant driven by
`prefers-color-scheme`, so sites with dark backgrounds get a widget that
doesn't look out of place by default.

**Acceptance criteria:**

- [ ] `src/styles.js` adds a `@media (prefers-color-scheme: dark)` block
      that adjusts the CSS custom properties (background, ink, border,
      etc.) sensibly.
- [ ] `data-theme="light" | "dark" | "auto"` config to force a mode,
      defaulting to `auto`.
- [ ] Contrast-checked against WCAG AA for text/background and focus
      indicators in both modes.
- [ ] No size-budget regression beyond a few hundred bytes gzipped.

---

## 7. Framework wrapper components (React / Vue)

**Labels:** `enhancement`, `help wanted`

**Body:**

LeadBox works as-is in a React/Vue app (it's just a script that mounts
itself), but a thin wrapper component would make lifecycle management
(mount on mount, `destroy()` on unmount, re-init on prop changes) more
idiomatic for framework users.

**Acceptance criteria:**

- [ ] `examples/react/LeadBoxWidget.jsx` — a small function component
      wrapping `LeadBox.init()`/`.destroy()` in `useEffect`.
- [ ] `examples/vue/LeadBoxWidget.vue` — equivalent using
      `onMounted`/`onUnmounted`.
- [ ] Both documented in the README under a new "Framework usage" section.
- [ ] These live under `examples/` as reference code, not published as
      separate npm packages (keeps the "zero runtime dependencies, one
      script tag" promise intact for the core widget).

---

## 8. Submission analytics dashboard (opt-in, static)

**Labels:** `enhancement`

**Body:**

For business owners using the Google Sheets backend, a small static page
(or a documented Google Sheets formula/pivot-table recipe) that turns raw
lead rows into a simple "leads per week," "top service requested," and
"top UTM source" view — without needing any new backend.

**Acceptance criteria:**

- [ ] `docs/reporting.md` with copy-paste Google Sheets formulas/pivot
      table steps using the existing `COLUMNS` from
      `examples/google-sheets-receiver.gs`.
- [ ] At least three example views: leads over time, leads by service,
      leads by UTM source.
- [ ] Explicitly scoped as a documentation/spreadsheet-recipe issue, not a
      new JS dashboard shipped in the widget bundle (keeps the size
      budget intact).
