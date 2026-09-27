// @ts-check
import { DEFAULT_LOCALE } from './locale.js';

/**
 * @typedef {'name'|'phone'|'email'|'message'|'service'|'preferredContact'} LeadBoxFieldKey
 */

/**
 * @typedef {Object} LeadBoxConfig
 * @property {string} endpoint URL leads are submitted to.
 * @property {string} method HTTP method, usually POST.
 * @property {'json'|'form'} encoding Body encoding: JSON or application/x-www-form-urlencoded.
 * @property {string} title Modal heading.
 * @property {string} subtitle Modal subheading.
 * @property {string} buttonText Text on the floating trigger button.
 * @property {'bottom-right'|'bottom-left'|'top-right'|'top-left'} position Trigger button position.
 * @property {string} accentColor CSS color used for buttons/accents.
 * @property {LeadBoxFieldKey[]} fields Ordered list of fields to render.
 * @property {LeadBoxFieldKey[]} requiredFields Fields that must be filled in.
 * @property {string[]} serviceOptions Options for the "service" select field.
 * @property {string} successMessage Message shown after a successful submit.
 * @property {string} [bookingUrl] Optional Calendly/Cal.com URL shown on success.
 * @property {string} [phone] Optional phone number shown as click-to-call on success.
 * @property {import('./locale.js').LeadBoxLocale} locale UI strings.
 * @property {boolean} debug When true, logs extra diagnostics to the console.
 * @property {number} minSubmitMs Minimum time (ms) the form must be open before submit is accepted.
 * @property {string} honeypotFieldName Name of the hidden spam-trap field.
 */

/** @type {LeadBoxConfig} */
export const DEFAULTS = {
  endpoint: '',
  method: 'POST',
  encoding: 'json',
  title: DEFAULT_LOCALE.title,
  subtitle: DEFAULT_LOCALE.subtitle,
  buttonText: DEFAULT_LOCALE.buttonText,
  position: 'bottom-right',
  accentColor: '#2563eb',
  fields: ['name', 'phone', 'email', 'message'],
  requiredFields: ['name', 'phone'],
  serviceOptions: [],
  successMessage: DEFAULT_LOCALE.successMessage,
  bookingUrl: undefined,
  phone: undefined,
  locale: DEFAULT_LOCALE,
  debug: false,
  minSubmitMs: 1500,
  honeypotFieldName: 'lb_hp',
};

const VALID_FIELDS = ['name', 'phone', 'email', 'message', 'service', 'preferredContact'];
const VALID_POSITIONS = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
const VALID_ENCODINGS = ['json', 'form'];

/**
 * Turn a comma-separated string into a trimmed, non-empty array of strings.
 * @param {string|undefined|null} value
 * @returns {string[]|undefined}
 */
function splitList(value) {
  if (value === undefined || value === null) return undefined;
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts;
}

/**
 * Parse a boolean-ish data attribute value ("true"/"false"/"1"/"0").
 * @param {string|undefined|null} value
 * @returns {boolean|undefined}
 */
function parseBool(value) {
  if (value === undefined || value === null) return undefined;
  return value === 'true' || value === '1' || value === '';
}

/**
 * Read a script element's `dataset` into a partial config object.
 * Unknown/absent attributes are simply omitted so later merge steps can
 * fall back to defaults.
 * @param {HTMLElement|null|undefined} el
 * @returns {Partial<LeadBoxConfig>}
 */
export function parseDataAttributes(el) {
  /** @type {Partial<LeadBoxConfig>} */
  const config = {};
  if (!el || !el.dataset) return config;
  const ds = el.dataset;

  if (ds.endpoint) config.endpoint = ds.endpoint;
  if (ds.method) config.method = ds.method.toUpperCase();
  if (ds.encoding && VALID_ENCODINGS.includes(ds.encoding)) {
    config.encoding = /** @type {'json'|'form'} */ (ds.encoding);
  }
  if (ds.title) config.title = ds.title;
  if (ds.subtitle) config.subtitle = ds.subtitle;
  if (ds.buttonText) config.buttonText = ds.buttonText;
  if (ds.position && VALID_POSITIONS.includes(ds.position)) {
    config.position = /** @type {LeadBoxConfig['position']} */ (ds.position);
  }
  if (ds.accentColor) config.accentColor = ds.accentColor;

  const fields = splitList(ds.fields);
  if (fields) {
    config.fields = /** @type {LeadBoxFieldKey[]} */ (
      fields.filter((field) => VALID_FIELDS.includes(field))
    );
  }
  const requiredFields = splitList(ds.requiredFields);
  if (requiredFields) {
    config.requiredFields = /** @type {LeadBoxFieldKey[]} */ (requiredFields);
  }
  const serviceOptions = splitList(ds.serviceOptions);
  if (serviceOptions) config.serviceOptions = serviceOptions;

  if (ds.successMessage) config.successMessage = ds.successMessage;
  if (ds.bookingUrl) config.bookingUrl = ds.bookingUrl;
  if (ds.phone) config.phone = ds.phone;
  const debug = parseBool(ds.debug);
  if (debug !== undefined) config.debug = debug;
  if (ds.minSubmitMs) config.minSubmitMs = Number(ds.minSubmitMs);
  if (ds.honeypotFieldName) config.honeypotFieldName = ds.honeypotFieldName;

  // Locale overrides: data-locale-success-message="..." -> locale.successMessage
  /** @type {Partial<import('./locale.js').LeadBoxLocale>} */
  const localeOverrides = {};
  for (const key of Object.keys(ds)) {
    if (key.startsWith('locale') && key !== 'locale') {
      const rest = key.slice('locale'.length);
      const localeKey = rest.charAt(0).toLowerCase() + rest.slice(1);
      const value = ds[key];
      if (value !== undefined) {
        localeOverrides[/** @type {keyof import('./locale.js').LeadBoxLocale} */ (localeKey)] =
          value;
      }
    }
  }
  if (Object.keys(localeOverrides).length > 0) {
    config.locale = /** @type {import('./locale.js').LeadBoxLocale} */ (localeOverrides);
  }

  return config;
}

/**
 * Deep-ish merge of config layers: defaults < data-attribute config < init() options.
 * Later layers win. The `locale` and array fields are merged/replaced as whole
 * values (arrays replace, locale merges key-by-key).
 * @param {...Partial<LeadBoxConfig>} layers
 * @returns {LeadBoxConfig}
 */
export function mergeConfig(...layers) {
  /** @type {LeadBoxConfig} */
  const result = { ...DEFAULTS, locale: { ...DEFAULT_LOCALE } };
  for (const layer of layers) {
    if (!layer) continue;
    for (const key of Object.keys(layer)) {
      if (key === 'locale' && layer.locale) {
        result.locale = { ...result.locale, ...layer.locale };
      } else {
        const resultRecord = /** @type {Record<string, unknown>} */ (result);
        const layerRecord = /** @type {Record<string, unknown>} */ (layer);
        resultRecord[key] = layerRecord[key];
      }
    }
  }
  return result;
}

/**
 * Validate + normalize a merged config, throwing on unrecoverable problems
 * (missing endpoint) and silently clamping out-of-range values.
 * @param {LeadBoxConfig} config
 * @returns {LeadBoxConfig}
 */
export function normalizeConfig(config) {
  const normalized = { ...config };
  normalized.fields = (normalized.fields || DEFAULTS.fields).filter((field) =>
    VALID_FIELDS.includes(field)
  );
  if (normalized.fields.length === 0) normalized.fields = [...DEFAULTS.fields];
  normalized.requiredFields = (normalized.requiredFields || []).filter((field) =>
    normalized.fields.includes(field)
  );
  if (!VALID_POSITIONS.includes(normalized.position)) normalized.position = DEFAULTS.position;
  if (!VALID_ENCODINGS.includes(normalized.encoding)) normalized.encoding = DEFAULTS.encoding;
  if (!normalized.method) normalized.method = DEFAULTS.method;
  if (!Number.isFinite(normalized.minSubmitMs) || normalized.minSubmitMs < 0) {
    normalized.minSubmitMs = DEFAULTS.minSubmitMs;
  }
  return normalized;
}
