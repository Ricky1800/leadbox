// @ts-check

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
 * CSS injected into the widget's shadow root. Uses CSS custom properties
 * (set on the shadow host, which inherit across the shadow boundary) so a
 * site owner can theme the widget from their own stylesheet without being
 * able to reach in and break its layout.
 * @param {import('./config.js').LeadBoxConfig} config
 * @returns {string}
 */
export function getStyles(config) {
  return `
:host {
  --leadbox-accent: ${config.accentColor};
  --leadbox-accent-ink: #ffffff;
  --leadbox-bg: #ffffff;
  --leadbox-ink: #111827;
  --leadbox-muted: #6b7280;
  --leadbox-border: #e5e7eb;
  --leadbox-error: #b91c1c;
  --leadbox-radius: 12px;
  --leadbox-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --leadbox-z: 2147483000;
  all: initial;
  font-family: var(--leadbox-font);
}

* { box-sizing: border-box; }

.lb-trigger {
  position: fixed;
  ${positionCss(config.position)}
  z-index: var(--leadbox-z);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  background: var(--leadbox-accent);
  color: var(--leadbox-accent-ink);
  border: none;
  border-radius: 999px;
  font-family: var(--leadbox-font);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.lb-trigger:hover { filter: brightness(0.95); }
.lb-trigger:focus-visible { outline: 3px solid var(--leadbox-accent); outline-offset: 3px; }

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
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  border-radius: 6px;
}

.lb-close:hover { background: var(--leadbox-border); }
.lb-close:focus-visible { outline: 2px solid var(--leadbox-accent); outline-offset: 2px; }

.lb-title { margin: 0 0 4px; font-size: 20px; font-weight: 700; padding-right: 28px; }
.lb-subtitle { margin: 0 0 16px; font-size: 14px; color: var(--leadbox-muted); }

.lb-field { margin-bottom: 14px; }
.lb-label { display: block; margin-bottom: 6px; font-size: 13px; font-weight: 600; }
.lb-input,
.lb-select,
.lb-textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 15px;
  font-family: var(--leadbox-font);
  border: 1px solid var(--leadbox-border);
  border-radius: 8px;
  color: var(--leadbox-ink);
  background: var(--leadbox-bg);
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
}

.lb-error {
  margin-top: 4px;
  font-size: 12px;
  color: var(--leadbox-error);
}
.lb-error:empty { display: none; }

.lb-radio-group { display: flex; gap: 12px; flex-wrap: wrap; }
.lb-radio-option { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }

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
  padding: 12px 16px;
  background: var(--leadbox-accent);
  color: var(--leadbox-accent-ink);
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
}
.lb-submit:disabled { opacity: 0.65; cursor: not-allowed; }
.lb-submit:focus-visible { outline: 2px solid var(--leadbox-ink); outline-offset: 2px; }

.lb-form-error {
  margin-top: 10px;
  font-size: 13px;
  color: var(--leadbox-error);
}
.lb-form-error:empty { display: none; }

.lb-success { text-align: center; }
.lb-success-message { font-size: 15px; margin: 8px 0 16px; }
.lb-success-actions { display: flex; flex-direction: column; gap: 8px; }
.lb-success-link {
  display: inline-block;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  border: 1px solid var(--leadbox-border);
  color: var(--leadbox-ink);
}
.lb-success-link.lb-primary {
  background: var(--leadbox-accent);
  color: var(--leadbox-accent-ink);
  border-color: transparent;
}

@media (max-width: 480px) {
  .lb-dialog { max-width: 100%; border-radius: var(--leadbox-radius) var(--leadbox-radius) 0 0; }
  .lb-overlay { padding: 0; align-items: flex-end; }
}

@media (prefers-reduced-motion: no-preference) {
  .lb-dialog { animation: lb-pop 160ms ease-out; }
}

@keyframes lb-pop {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
`;
}
