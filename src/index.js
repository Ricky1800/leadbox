// @ts-check
import { parseDataAttributes, mergeConfig, normalizeConfig, DEFAULTS } from './config.js';
import { LeadBoxWidget } from './dialog.js';
import { THEMES, THEME_NAMES, DEFAULT_THEME_NAME } from './themes.js';

// Re-exported for advanced consumers (e.g. the theme gallery demo, or a site
// that wants to mount several independent widgets on one page): the public
// `LeadBox` facade above only ever tracks one singleton instance.
export { LeadBoxWidget, mergeConfig, normalizeConfig, DEFAULTS, THEMES, THEME_NAMES, DEFAULT_THEME_NAME };

/**
 * @typedef {import('./config.js').LeadBoxConfig} LeadBoxConfig
 */

/** @type {LeadBoxWidget|null} */
let instance = null;

/**
 * Initialize (or re-initialize) the widget.
 *
 * Config is resolved by merging, in order (later wins):
 *   1. Built-in defaults
 *   2. `data-*` attributes on the script tag that loaded LeadBox
 *   3. The options object passed here
 *
 * Calling this again tears down any previously mounted widget first, so it
 * is safe to call more than once (e.g. after a SPA route change).
 * @param {Partial<LeadBoxConfig>} [options]
 * @param {{ fetchImpl?: typeof fetch, now?: () => number, scriptEl?: HTMLElement|null }} [deps]
 * @returns {LeadBoxWidget}
 */
export function init(options = {}, deps = {}) {
  if (instance) {
    instance.destroy();
    instance = null;
  }

  const scriptEl =
    deps.scriptEl !== undefined
      ? deps.scriptEl
      : typeof document !== 'undefined'
        ? /** @type {HTMLElement|null} */ (document.currentScript)
        : null;

  const dataConfig = parseDataAttributes(scriptEl);
  const merged = mergeConfig(dataConfig, options);
  const config = normalizeConfig(merged);

  if (!config.endpoint && config.debug) {
    console.warn('[leadbox] No endpoint configured — submissions will fail. Set data-endpoint or endpoint in LeadBox.init().');
  }

  instance = new LeadBoxWidget(config, { fetchImpl: deps.fetchImpl, now: deps.now });
  instance.mount();
  return instance;
}

/** Open the widget's dialog. No-op if not yet initialized. */
export function open() {
  if (instance) instance.open();
}

/** Close the widget's dialog. No-op if not yet initialized. */
export function close() {
  if (instance) instance.close();
}

/** Tear down the current widget instance, if any. Mainly useful for tests/SPAs. */
export function destroy() {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}

/** @returns {LeadBoxWidget|null} The current widget instance, if any. */
export function getInstance() {
  return instance;
}

export const LeadBox = { init, open, close, destroy, getInstance };
export default LeadBox;

/**
 * Auto-init: when this module is loaded as a classic `<script>` tag with a
 * `data-endpoint` (or `data-auto-init="false"` to opt out), initialize
 * automatically using the tag's `data-*` attributes. This only fires in a
 * real browser and is a no-op during SSR/tests that import the module
 * directly without a `document`.
 */
if (typeof document !== 'undefined') {
  const currentScript = /** @type {HTMLElement|null} */ (document.currentScript);
  if (currentScript && currentScript.dataset.autoInit !== 'false' && currentScript.dataset.endpoint) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => init({}, { scriptEl: currentScript }));
    } else {
      init({}, { scriptEl: currentScript });
    }
  }
  // Expose a global for classic-script consumers (`<script src=".../leadbox.min.js">`).
  const globalTarget = /** @type {Record<string, unknown>} */ (
    /** @type {unknown} */ (typeof window !== 'undefined' ? window : globalThis)
  );
  globalTarget.LeadBox = LeadBox;
}
