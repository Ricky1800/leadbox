// @ts-check

/**
 * @typedef {Object} SubmitPayload
 * Combined shape of everything sent to the receiving endpoint: form field
 * values plus non-invasive page context. Keys are intentionally flat so
 * Google Sheets / Zapier / Formspree can map columns directly.
 * @property {string} [name]
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [message]
 * @property {string} [service]
 * @property {string} [preferredContact]
 * @property {string} pageUrl
 * @property {string} referrer
 * @property {string} [utm_source]
 * @property {string} [utm_medium]
 * @property {string} [utm_campaign]
 * @property {string} [utm_term]
 * @property {string} [utm_content]
 * @property {string} submittedAt ISO timestamp.
 */

/**
 * Encode a payload for the wire according to the configured encoding.
 * @param {'json'|'form'} encoding
 * @param {SubmitPayload} payload
 * @returns {{ body: string, headers: Object<string, string> }}
 */
export function encodePayload(encoding, payload) {
  if (encoding === 'form') {
    const params = new URLSearchParams();
    for (const key of Object.keys(payload)) {
      const value = /** @type {Record<string, unknown>} */ (payload)[key];
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    }
    return {
      body: params.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };
  }
  return {
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  };
}

/**
 * @typedef {Object} SubmitResult
 * @property {boolean} ok
 * @property {number} [status]
 * @property {string} [error] Human-readable failure reason when `ok` is false.
 */

/**
 * Submit a lead to the configured endpoint. Retry-safe: this function makes
 * exactly one network attempt and reports success/failure so the caller can
 * decide whether to re-enable the submit button for a manual retry.
 * @param {Object} options
 * @param {string} options.endpoint
 * @param {string} options.method
 * @param {'json'|'form'} options.encoding
 * @param {SubmitPayload} options.payload
 * @param {typeof fetch} [options.fetchImpl] Injectable for testing.
 * @returns {Promise<SubmitResult>}
 */
export async function submitLead({ endpoint, method, encoding, payload, fetchImpl }) {
  const doFetch = fetchImpl || (typeof fetch !== 'undefined' ? fetch : undefined);
  if (!endpoint) {
    return { ok: false, error: 'No endpoint configured.' };
  }
  if (!doFetch) {
    return { ok: false, error: 'fetch is not available in this environment.' };
  }

  const { body, headers } = encodePayload(encoding, payload);

  try {
    const response = await doFetch(endpoint, {
      method: method || 'POST',
      headers,
      body,
    });
    if (response && response.ok) {
      return { ok: true, status: response.status };
    }
    return {
      ok: false,
      status: response ? response.status : undefined,
      error: `Request failed with status ${response ? response.status : 'unknown'}.`,
    };
  } catch (/** @type {unknown} */ err) {
    const message = err instanceof Error ? err.message : 'Network error.';
    return { ok: false, error: message };
  }
}
