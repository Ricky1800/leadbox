// @ts-check

/**
 * Reasonably strict but permissive email check. Not a full RFC 5322
 * implementation on purpose — this is a UX check, the real validation
 * happens (or should happen) server-side.
 * @type {RegExp}
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Accepts digits with optional leading +, spaces, dashes, dots, and
 * parentheses. Requires at least 7 digits total.
 * @type {RegExp}
 */
export const PHONE_RE = /^\+?[0-9()\-.\s]{7,20}$/;

/**
 * @typedef {Object} FieldValidationResult
 * @property {boolean} valid
 * @property {string} [message]
 */

/**
 * Validate a single field's value.
 * @param {import('./config.js').LeadBoxFieldKey} field
 * @param {string} value
 * @param {boolean} required
 * @param {import('./locale.js').LeadBoxLocale} locale
 * @returns {FieldValidationResult}
 */
export function validateField(field, value, required, locale) {
  const trimmed = (value || '').trim();

  if (required && trimmed.length === 0) {
    return { valid: false, message: locale.requiredError };
  }

  if (trimmed.length === 0) {
    // Optional and empty: nothing further to check.
    return { valid: true };
  }

  if (field === 'email' && !EMAIL_RE.test(trimmed)) {
    return { valid: false, message: locale.emailError };
  }

  if (field === 'phone' && !PHONE_RE.test(trimmed)) {
    return { valid: false, message: locale.phoneError };
  }

  return { valid: true };
}

/**
 * @typedef {Object} FormValidationResult
 * @property {boolean} valid
 * @property {Object<string, string>} errors Field name -> error message.
 */

/**
 * Validate an entire set of form values against the configured fields.
 * @param {import('./config.js').LeadBoxFieldKey[]} fields
 * @param {import('./config.js').LeadBoxFieldKey[]} requiredFields
 * @param {Object<string, string>} values
 * @param {import('./locale.js').LeadBoxLocale} locale
 * @returns {FormValidationResult}
 */
export function validateForm(fields, requiredFields, values, locale) {
  /** @type {Object<string, string>} */
  const errors = {};
  for (const field of fields) {
    if (field === 'preferredContact') continue; // radio/select, always "valid"
    const required = requiredFields.includes(field);
    const result = validateField(field, values[field] || '', required, locale);
    if (!result.valid && result.message) {
      errors[field] = result.message;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
