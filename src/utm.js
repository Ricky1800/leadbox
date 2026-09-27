// @ts-check

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

/**
 * @typedef {Object} PageContext
 * @property {string} pageUrl Full current page URL (no cookies/tracking involved — read from `location`).
 * @property {string} referrer `document.referrer`, if any.
 * @property {string} [utm_source]
 * @property {string} [utm_medium]
 * @property {string} [utm_campaign]
 * @property {string} [utm_term]
 * @property {string} [utm_content]
 */

/**
 * Capture non-invasive page context: the current URL, referrer, and any UTM
 * query params. No cookies, storage, or fingerprinting are used — this only
 * reads values already present in the current navigation.
 * @param {Location} [location] Defaults to `window.location`.
 * @param {string} [referrer] Defaults to `document.referrer`.
 * @returns {PageContext}
 */
export function captureContext(location, referrer) {
  const loc = location || (typeof window !== 'undefined' ? window.location : undefined);
  const ref = referrer !== undefined ? referrer : typeof document !== 'undefined' ? document.referrer : '';

  /** @type {PageContext} */
  const context = {
    pageUrl: loc ? loc.href : '',
    referrer: ref || '',
  };

  if (loc && loc.search) {
    const params = new URLSearchParams(loc.search);
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) {
        context[/** @type {keyof PageContext} */ (key)] = value;
      }
    }
  }

  return context;
}
