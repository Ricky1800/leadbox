# LeadBox

A tiny, dependency-free "Get a Free Quote" widget any small business can
drop into any website with one `<script>` tag — no npm install, no build
step, no server required.

**Live demo:** https://ricky1800.github.io/leadbox/demo/

## The problem

A local business (a landscaper, a plumber, a salon) usually has one of
three setups: no website at all, a static site with no way to actually
capture a lead, or a page builder whose "contact form" either costs extra
every month or ships megabytes of JavaScript for a form with four fields.
None of that is necessary. LeadBox is a single script tag, a floating
button, an accessible modal form, and a free Google Sheet as the backend —
the whole thing is under 10 KB gzipped.

## 30-second install

```html
<script
  src="https://cdn.jsdelivr.net/gh/Ricky1800/leadbox@v0.1.0/dist/leadbox.min.js"
  data-endpoint="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
  data-title="Get a Free Quote"
  data-accent-color="#2563eb"
></script>
```

Paste that before `</body>` on any site — WordPress, Wix, Squarespace,
Shopify, or a plain HTML page — and you have a working lead-capture form.
Don't have a backend yet? See [Backends](#backends) below; the Google
Sheets option takes about five minutes and is completely free.

## How it works

- A small floating button renders in the corner of the page.
- Clicking it opens an accessible modal dialog with the fields you
  configure (name, phone, email, message, a service dropdown, preferred
  contact method).
- On submit, LeadBox validates the fields client-side, runs a couple of
  lightweight spam checks, attaches the page URL/referrer/UTM params, and
  POSTs the result to your configured `endpoint` as JSON or
  form-urlencoded data.
- On success, it shows a thank-you message with optional "Book a time"
  and "Call us now" links.

Everything renders inside a **Shadow DOM**, so the widget can't be broken
by the host site's CSS, and the host site's CSS can't be broken by it
either.

## Configuration

Configure via `data-*` attributes on the `<script>` tag, or by calling
`LeadBox.init({...})` yourself (e.g. with `data-auto-init="false"` if you
want to control exactly when it mounts). Options passed to `init()` take
precedence over `data-*` attributes, which take precedence over defaults.

| Option (`init()` key) | `data-*` attribute | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | `data-endpoint` | *(required)* | URL leads are POSTed to. |
| `method` | `data-method` | `POST` | HTTP method. |
| `encoding` | `data-encoding` | `json` | `json` or `form` (`application/x-www-form-urlencoded`). |
| `title` | `data-title` | `Get a Free Quote` | Modal heading. |
| `subtitle` | `data-subtitle` | *(see locale)* | Modal subheading. |
| `buttonText` | `data-button-text` | `Get a Free Quote` | Text on the floating trigger button. |
| `position` | `data-position` | `bottom-right` | One of `bottom-right`, `bottom-left`, `top-right`, `top-left`. |
| `accentColor` | `data-accent-color` | `#2563eb` | CSS color for buttons/accents. |
| `fields` | `data-fields` | `name,phone,email,message` | Comma-separated: `name`, `phone`, `email`, `message`, `service`, `preferredContact`. |
| `requiredFields` | `data-required-fields` | `name,phone` | Comma-separated subset of `fields`. |
| `serviceOptions` | `data-service-options` | `[]` | Comma-separated options for the `service` dropdown. |
| `successMessage` | `data-success-message` | *(see locale)* | Message shown after a successful submit. |
| `bookingUrl` | `data-booking-url` | *(none)* | Optional Calendly/Cal.com link shown on the success screen. |
| `phone` | `data-phone` | *(none)* | Optional phone number shown as a click-to-call link on the success screen. |
| `minSubmitMs` | `data-min-submit-ms` | `1500` | Minimum time (ms) the form must be open before a submit is accepted (spam heuristic). |
| `honeypotFieldName` | `data-honeypot-field-name` | `lb_hp` | Name of the hidden spam-trap field, in case it collides with something. |
| `debug` | `data-debug` | `false` | Logs extra diagnostics (e.g. missing endpoint, spam blocks) to the console. |
| — | `data-auto-init` | `true` | Set to `"false"` to skip auto-init and call `LeadBox.init()` yourself. |
| `locale` | `data-locale-<key>` | *(English)* | Override any UI string, e.g. `data-locale-submit-button-text="Enviar"`. See `src/locale.js` for all keys. |

### Public API

```js
LeadBox.init({ endpoint: '...', /* ...any option above... */ });
LeadBox.open();
LeadBox.close();
LeadBox.destroy();   // tear down, e.g. before re-init in an SPA
LeadBox.getInstance();
```

### Events

LeadBox dispatches bubbling `CustomEvent`s from its host element (so you
can listen on `document`):

```js
document.addEventListener('leadbox:submit', (e) => {
  // e.detail = { payload, spam: boolean } — fires on every submit attempt.
});
document.addEventListener('leadbox:success', (e) => {
  // e.detail = { payload, status }
});
document.addEventListener('leadbox:error', (e) => {
  // e.detail = { error, status }
});
```

## Backends

LeadBox POSTs plain JSON or form-encoded data — pick whichever receiver
fits:

- **[Google Sheets](docs/google-sheets.md)** — free, no server, a Google
  Apps Script appends each lead to a Sheet (+ optional email notification).
- **[Formspree](docs/formspree.md)** — a hosted form backend, free tier
  available, zero setup beyond creating a form.
- **[Zapier / Make](docs/zapier-make.md)** — webhook-based, routes a lead
  into a CRM, Slack, email, SMS, or anywhere else.

## Embedding on your platform

- [WordPress](docs/wordpress.md)
- [Wix](docs/wix.md)
- [Squarespace](docs/squarespace.md)
- [Shopify](docs/shopify.md)

For a plain HTML/static site, just paste the script tag before `</body>`.

## Accessibility

- The dialog uses `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby`/`aria-describedby`, and traps focus (Tab/Shift+Tab
  cycle within the dialog) while open.
- `Escape` closes the dialog and returns focus to the element that
  triggered it.
- Fields with errors get `aria-invalid="true"` and an `aria-describedby`
  pointing at the visible error text.
- Animation is gated behind `@media (prefers-reduced-motion: no-preference)`
  — it's skipped entirely for users who've asked their OS to reduce motion.
- Rendered in Shadow DOM with its own stylesheet, so host-page CSS
  (including CSS that would otherwise break contrast, focus outlines, or
  font sizing) can't interfere with it.

## Privacy

- No cookies. No localStorage. No third-party trackers, pixels, or
  analytics of any kind.
- The only page context captured is what's already present in the current
  navigation: the page URL, `document.referrer`, and `utm_*` query params
  — nothing is read from browsing history or other tabs.
- Spam filtering (a honeypot field + a minimum time-to-submit check) is
  entirely client-side heuristics, not fingerprinting.

## Size budget

`dist/leadbox.min.js` is checked in CI to stay under **10 KB gzipped**
(`npm run size`). At the time of writing it's about 6.5 KB gzipped.

## Development

```bash
npm install
npm run lint        # eslint
npm run typecheck   # tsc --noEmit (checkJs against src/**/*.js)
npm test            # vitest + happy-dom
npm run build       # esbuild -> dist/leadbox.min.js, dist/leadbox.esm.js
npm run size        # gzip size budget check
npm run check       # all of the above, in order
```

The demo page lives at `demo/index.html` and can be opened locally with
any static file server (e.g. `npx serve .`) — it loads `../dist/leadbox.min.js`
directly, so run `npm run build` first if you've changed `src/`.

## Roadmap

See [ROADMAP_ISSUES.md](ROADMAP_ISSUES.md) for planned/possible future
work (translations, a file-upload field, multi-step forms, and more) —
each one is scoped as a ready-to-file GitHub issue with acceptance
criteria. Contributions on any of these are welcome.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Authors

- [@Ricky1800](https://github.com/Ricky1800)
- [@orbitwebsites-cloud](https://github.com/orbitwebsites-cloud) ([OrbitBoyzz](https://orbitboyzz.me))

## License

[MIT](LICENSE) © 2026 Ricky1800
