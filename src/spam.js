// @ts-check

/**
 * @typedef {Object} SpamCheckInput
 * @property {string} honeypotValue Value of the hidden honeypot field (should be empty).
 * @property {number} renderedAt `Date.now()` timestamp of when the form was rendered/opened.
 * @property {number} submittedAt `Date.now()` timestamp of the submit attempt.
 * @property {number} minSubmitMs Minimum elapsed time (ms) considered human.
 */

/**
 * @typedef {Object} SpamCheckResult
 * @property {boolean} isSpam
 * @property {'honeypot'|'too-fast'|null} reason
 */

/**
 * Very lightweight client-side spam heuristics. These are not a substitute
 * for server-side verification (e.g. reCAPTCHA/hCaptcha or a rate limit on
 * the receiving endpoint) but they filter out the majority of naive bots
 * that fill every field and submit instantly.
 * @param {SpamCheckInput} input
 * @returns {SpamCheckResult}
 */
export function checkSpam({ honeypotValue, renderedAt, submittedAt, minSubmitMs }) {
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return { isSpam: true, reason: 'honeypot' };
  }
  const elapsed = submittedAt - renderedAt;
  if (Number.isFinite(elapsed) && elapsed < minSubmitMs) {
    return { isSpam: true, reason: 'too-fast' };
  }
  return { isSpam: false, reason: null };
}
