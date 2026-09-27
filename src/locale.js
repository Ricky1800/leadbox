// @ts-check

/**
 * Default (English) locale strings. Any key can be overridden via
 * `data-locale-<key>` attributes (kebab-case) or the `locale` key passed to
 * `LeadBox.init()`.
 * @typedef {Object} LeadBoxLocale
 * @property {string} title
 * @property {string} subtitle
 * @property {string} buttonText
 * @property {string} openButtonLabel
 * @property {string} closeButtonLabel
 * @property {string} nameLabel
 * @property {string} phoneLabel
 * @property {string} emailLabel
 * @property {string} messageLabel
 * @property {string} serviceLabel
 * @property {string} servicePlaceholder
 * @property {string} preferredContactLabel
 * @property {string} preferredContactEmail
 * @property {string} preferredContactPhone
 * @property {string} preferredContactText
 * @property {string} submitButtonText
 * @property {string} submittingText
 * @property {string} successTitle
 * @property {string} successMessage
 * @property {string} errorMessage
 * @property {string} requiredError
 * @property {string} emailError
 * @property {string} phoneError
 * @property {string} bookingLinkText
 * @property {string} callLinkText
 */

/** @type {LeadBoxLocale} */
export const DEFAULT_LOCALE = {
  title: 'Get a Free Quote',
  subtitle: "Tell us a bit about your project and we'll get back to you shortly.",
  buttonText: 'Get a Free Quote',
  openButtonLabel: 'Open the get a free quote form',
  closeButtonLabel: 'Close',
  nameLabel: 'Name',
  phoneLabel: 'Phone',
  emailLabel: 'Email',
  messageLabel: 'Message',
  serviceLabel: 'Service',
  servicePlaceholder: 'Select a service',
  preferredContactLabel: 'Preferred contact method',
  preferredContactEmail: 'Email',
  preferredContactPhone: 'Phone',
  preferredContactText: 'Text',
  submitButtonText: 'Send',
  submittingText: 'Sending…',
  successTitle: 'Request sent!',
  successMessage: "Thanks! We've received your request and will be in touch soon.",
  errorMessage: 'Something went wrong. Please try again, or call us directly.',
  requiredError: 'This field is required.',
  emailError: 'Enter a valid email address.',
  phoneError: 'Enter a valid phone number.',
  bookingLinkText: 'Book a time on our calendar',
  callLinkText: 'Call us now',
};
