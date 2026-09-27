// @ts-check
import { resolveThemeTokens } from './themes.js';

/**
 * Position -> CSS for the fixed host container.
 * @param {import('./config.js').LeadBoxConfig['position']} position
 * @returns {string}
 */
function positionCss(position) {
  switch (position) {
    case 'bottom-left':
      return 'bottom: 20px; left: 20px;';
    case 'top-right':
      return 'top: 20px; right: 20px;';
    case 'top-left':
      return 'top: 20px; left: 20px;';
    case 'bottom-right':
    default:
      return 'bottom: 20px; right: 20px;';
  }
}

/**
 * Render a token set as `--leadbox-<key>: value;` custom property lines.
 * Keys are already camelCase (accentInk, shadowTrigger, ...) and are mapped
 * to kebab-case custom property names.
 * @param {import('./themes.js').LeadBoxThemeTokens | Partial<import('./themes.js').LeadBoxThemeTokens>} tokens
 * @returns {string}
 */
function tokensToCss(tokens) {
  return Object.keys(tokens)
    .map((key) => {
      const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      return `  --leadbox-${cssKey}: ${/** @type {Record<string, string>} */ (tokens)[key]};`;
    })
    .join('\n');
}

/**
 * CSS injected into the widget's shadow root. Uses CSS custom properties
 * (set on the shadow host, which inherit across the shadow boundary) so a
 * site owner can theme the widget from their own stylesheet without being
 * able to reach in and break its layout.
 *
 * Theme resolution order (later wins):
 *   1. The selected preset's light tokens (`config.theme`, default `default`)
 *   2. That preset's dark overrides, scoped to a dark-mode context when
 *      `config.colorScheme` is `dark`, or to `prefers-color-scheme: dark`
 *      when it's `auto` (the default) — never applied when it's `light`.
 *   3. `config.accentColor`, a single-token escape hatch for callers who
 *      just want to swap the accent without picking a whole new theme.
 * @param {import('./config.js').LeadBoxConfig} config
 * @returns {string}
 */
export function getStyles(config) {
  const light = resolveThemeTokens(config.theme, 'light');
  const dark = resolveThemeTokens(config.theme, 'dark');
  const accentOverride = config.accentColor ? `\n  --leadbox-accent: ${config.accentColor};` : '';

  const darkBlock =
    config.colorScheme === 'dark'
      ? `:host {\n${tokensToCss(dark)}\n}`
      : config.colorScheme === 'light'
        ? ''
        : `@media (prefers-color-scheme: dark) {\n  :host {\n${tokensToCss(dark)}\n  }\n}`;

  return `
:host {
${tokensToCss(light)}
  --leadbox-z: 2147483000;
  all: initial;
  font-family: var(--leadbox-font);${accentOverride}
}

${darkBlock}

* { box-sizing: border-box; }

.lb-trigger {
  position: fixed;
  ${positionCss(config.position)}
  z-index: var(--leadbox-z);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  background: var(--leadbox-accent);
  color: var(--leadbox-accent-ink);
  border: none;
  border-radius: var(--leadbox-radius);
  font-family: var(--leadbox-font);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--leadbox-shadow-trigger);
  transition: transform 120ms ease, filter 120ms ease, box-shadow 120ms ease;
}

.lb-trigger:hover { filter: brightness(0.95); transform: translateY(-1px); }
.lb-trigger:active { transform: translateY(0); }
.lb-trigger:focus-visible {
  outline: 3px solid var(--leadbox-accent);
  outline-offset: 3px;
}

.lb-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--leadbox-z);
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.lb-overlay[hidden] { display: none; }

.lb-dialog {
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: var(--leadbox-bg);
  color: var(--leadbox-ink);
  border-radius: var(--leadbox-radius);
  padding: 28px 24px 24px;
  box-shadow: var(--leadbox-shadow-dialog);
}

.lb-dialog:focus-visible,
.lb-dialog:focus {
  outline: none;
}

.lb-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--leadbox-muted);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  border-radius: var(--leadbox-radius-sm);
}

.lb-close:hover { background: var(--leadbox-border); }
.lb-close:focus-visible { outline: 2px solid var(--leadbox-accent); outline-offset: 2px; }

.lb-title { margin: 0 0 6px; font-size: 20px; font-weight: 700; padding-right: 28px; line-height: 1.25; }
.lb-subtitle { margin: 0 0 20px; font-size: 14px; color: var(--leadbox-muted); line-height: 1.5; }

.lb-field { margin-bottom: 16px; }
.lb-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; }
.lb-input,
.lb-select,
.lb-textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  font-family: var(--leadbox-font);
  border: 1px solid var(--leadbox-border);
  border-radius: var(--leadbox-radius-sm);
  color: var(--leadbox-ink);
  background: var(--leadbox-bg);
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.lb-textarea { min-height: 80px; resize: vertical; }
.lb-input:focus,
.lb-select:focus,
.lb-textarea:focus {
  outline: 2px solid var(--leadbox-accent);
  outline-offset: 1px;
  border-color: var(--leadbox-accent);
}
.lb-input[aria-invalid="true"],
.lb-select[aria-invalid="true"],
.lb-textarea[aria-invalid="true"] {
  border-color: var(--leadbox-error);
  box-shadow: 0 0 0 1px var(--leadbox-error);
}

.lb-error {
  margin-top: 5px;
  font-size: 12px;
  color: var(--leadbox-error);
  display: flex;
  align-items: center;
  gap: 4px;
}
.lb-error:empty { display: none; margin-top: 0; }
.lb-error::before {
  content: "";
  flex: none;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--leadbox-error);
}
.lb-error:empty::before { display: none; }

.lb-radio-group { display: flex; gap: 14px; flex-wrap: wrap; }
.lb-radio-option { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }
.lb-radio-option input:focus-visible { outline: 2px solid var(--leadbox-accent); outline-offset: 2px; }

.lb-hp-field {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  white-space: nowrap !important;
  left: -9999px !important;
}

.lb-submit {
  width: 100%;
  padding: 13px 16px;
  background: var(--leadbox-accent);
  color: var(--leadbox-accent-ink);
  border: none;
  border-radius: var(--leadbox-radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 6px;
  transition: filter 120ms ease, transform 120ms ease;
}
.lb-submit:hover:not(:disabled) { filter: brightness(0.95); }
.lb-submit:disabled { opacity: 0.65; cursor: not-allowed; }
.lb-submit:focus-visible { outline: 2px solid var(--leadbox-ink); outline-offset: 2px; }

.lb-form-error {
  margin-top: 12px;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--leadbox-error);
  background: color-mix(in srgb, var(--leadbox-error) 10%, transparent);
  border-radius: var(--leadbox-radius-sm);
}
.lb-form-error:empty { display: none; padding: 0; margin-top: 0; }

.lb-success { text-align: center; padding-top: 4px; }
.lb-success-check {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--leadbox-success) 15%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}
.lb-success-check svg { width: 28px; height: 28px; display: block; }
.lb-success-check circle {
  fill: none;
  stroke: var(--leadbox-success);
  stroke-width: 2;
  stroke-linecap: round;
}
.lb-success-check path {
  fill: none;
  stroke: var(--leadbox-success);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.lb-success-title { margin: 0 0 6px; font-size: 17px; font-weight: 700; }
.lb-success-message { font-size: 14px; color: var(--leadbox-muted); margin: 0 0 20px; line-height: 1.5; }
.lb-success-actions { display: flex; flex-direction: column; gap: 8px; }
.lb-success-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 16px;
  border-radius: var(--leadbox-radius-sm);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid var(--leadbox-border);
  color: var(--leadbox-ink);
  transition: filter 120ms ease, transform 120ms ease;
}
.lb-success-link:hover { filter: brightness(0.97); }
.lb-success-link:focus-visible { outline: 2px solid var(--leadbox-accent); outline-offset: 2px; }
.lb-success-link.lb-primary {
  background: var(--leadbox-accent);
  color: var(--leadbox-accent-ink);
  border-color: transparent;
}

/* Mobile bottom sheet: full-width, anchored to the bottom edge, with a
   drag-handle affordance and rounded top corners only. */
@media (max-width: 480px) {
  .lb-overlay { padding: 0; align-items: flex-end; }
  .lb-dialog {
    max-width: 100%;
    max-height: calc(100vh - 24px);
    border-radius: var(--leadbox-radius) var(--leadbox-radius) 0 0;
    padding-top: 24px;
  }
  .lb-dialog::before {
    content: "";
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: var(--leadbox-border);
  }
  .lb-trigger { right: 16px; bottom: 16px; left: auto; top: auto; padding: 13px 18px; }
}

@media (prefers-reduced-motion: no-preference) {
  .lb-dialog { animation: lb-pop 180ms cubic-bezier(0.16, 1, 0.3, 1); }
  .lb-success-check circle {
    stroke-dasharray: 63;
    stroke-dashoffset: 63;
    animation: lb-draw 420ms ease-out 80ms forwards;
  }
  .lb-success-check path {
    stroke-dasharray: 20;
    stroke-dashoffset: 20;
    animation: lb-draw 260ms ease-out 420ms forwards;
  }
}

@keyframes lb-pop {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes lb-draw {
  to { stroke-dashoffset: 0; }
}
`;
}
