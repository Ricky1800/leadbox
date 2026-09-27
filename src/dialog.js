// @ts-check
import { getStyles } from './styles.js';
import { validateForm } from './validate.js';
import { checkSpam } from './spam.js';
import { captureContext } from './utm.js';
import { submitLead } from './submit.js';
import { emit, EVENTS } from './events.js';

/** Selector for elements that can receive keyboard focus, used by the focus trap. */
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), ' +
  'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * @typedef {Object} LeadBoxDeps
 * Injectable dependencies, primarily so tests can substitute `fetch` and the
 * clock without touching global state.
 * @property {typeof fetch} [fetchImpl]
 * @property {() => number} [now]
 */

/**
 * The floating button + accessible modal dialog. One instance is created per
 * `LeadBox.init()` call and rendered into a Shadow DOM host appended to
 * `document.body`, so host-page CSS cannot reach in and break it.
 */
export class LeadBoxWidget {
  /**
   * @param {import('./config.js').LeadBoxConfig} config
   * @param {LeadBoxDeps} [deps]
   */
  constructor(config, deps = {}) {
    /** @type {import('./config.js').LeadBoxConfig} */
    this.config = config;
    this.deps = deps;
    this.renderedAt = (deps.now || Date.now)();

    /** @type {HTMLElement|null} */
    this.host = null;
    /** @type {ShadowRoot|null} */
    this.shadow = null;
    /** @type {HTMLButtonElement|null} */
    this.trigger = null;
    /** @type {HTMLDivElement|null} */
    this.overlay = null;
    /** @type {HTMLDivElement|null} */
    this.dialogEl = null;
    /** @type {HTMLFormElement|null} */
    this.form = null;
    /** @type {HTMLButtonElement|null} */
    this.submitButton = null;
    /** @type {HTMLDivElement|null} */
    this.formErrorEl = null;
    /** @type {HTMLDivElement|null} */
    this.successEl = null;
    /** @type {Element|null} */
    this.lastFocused = null;
    /** @type {boolean} */
    this.isOpen = false;
    /** @type {Object<string, HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>} */
    this.inputs = {};
    /** @type {Object<string, HTMLDivElement>} */
    this.errorEls = {};
    /** @type {HTMLInputElement|null} */
    this.honeypotInput = null;

    this._onKeydown = this._onKeydown.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onOverlayClick = this._onOverlayClick.bind(this);
  }

  /**
   * Build and attach the widget to the page. Safe to call once per instance.
   * @param {ParentNode & Node} [parent]
   */
  mount(parent) {
    const target = parent || document.body;
    const locale = this.config.locale;

    this.host = document.createElement('div');
    this.host.id = 'leadbox-root';
    this.shadow = this.host.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = getStyles(this.config);
    this.shadow.appendChild(style);

    this.trigger = document.createElement('button');
    this.trigger.type = 'button';
    this.trigger.className = 'lb-trigger';
    this.trigger.setAttribute('aria-haspopup', 'dialog');
    this.trigger.setAttribute('aria-label', locale.openButtonLabel);
    this.trigger.textContent = this.config.buttonText;
    this.trigger.addEventListener('click', () => this.open());
    this.shadow.appendChild(this.trigger);

    this.overlay = document.createElement('div');
    this.overlay.className = 'lb-overlay';
    this.overlay.hidden = true;
    this.overlay.addEventListener('mousedown', this._onOverlayClick);

    this.dialogEl = document.createElement('div');
    this.dialogEl.className = 'lb-dialog';
    this.dialogEl.setAttribute('role', 'dialog');
    this.dialogEl.setAttribute('aria-modal', 'true');
    this.dialogEl.setAttribute('aria-labelledby', 'lb-title');
    this.dialogEl.setAttribute('aria-describedby', 'lb-subtitle');
    this.dialogEl.setAttribute('tabindex', '-1');
    // Stop clicks inside the dialog from bubbling to the overlay's close handler.
    this.dialogEl.addEventListener('mousedown', (e) => e.stopPropagation());

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lb-close';
    closeBtn.setAttribute('aria-label', locale.closeButtonLabel);
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => this.close());
    this.dialogEl.appendChild(closeBtn);

    const title = document.createElement('h2');
    title.className = 'lb-title';
    title.id = 'lb-title';
    title.textContent = this.config.title;
    this.dialogEl.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.className = 'lb-subtitle';
    subtitle.id = 'lb-subtitle';
    subtitle.textContent = this.config.subtitle;
    this.dialogEl.appendChild(subtitle);

    this.form = document.createElement('form');
    this.form.noValidate = true;
    this._renderFields(this.form);
    this._renderHoneypot(this.form);

    this.formErrorEl = document.createElement('div');
    this.formErrorEl.className = 'lb-form-error';
    this.formErrorEl.setAttribute('role', 'alert');
    this.form.appendChild(this.formErrorEl);

    this.submitButton = document.createElement('button');
    this.submitButton.type = 'submit';
    this.submitButton.className = 'lb-submit';
    this.submitButton.textContent = locale.submitButtonText;
    this.form.appendChild(this.submitButton);

    this.form.addEventListener('submit', this._onSubmit);
    this.dialogEl.appendChild(this.form);

    this.successEl = document.createElement('div');
    this.successEl.className = 'lb-success';
    this.successEl.hidden = true;
    this.successEl.tabIndex = -1;
    this.successEl.setAttribute('role', 'status');
    this.successEl.setAttribute('aria-live', 'polite');
    this._renderSuccess(this.successEl);
    this.dialogEl.appendChild(this.successEl);

    this.overlay.appendChild(this.dialogEl);
    this.shadow.appendChild(this.overlay);

    target.appendChild(this.host);
  }

  /**
   * @param {HTMLFormElement} form
   */
  _renderFields(form) {
    const locale = this.config.locale;
    for (const field of this.config.fields) {
      const wrapper = document.createElement('div');
      wrapper.className = 'lb-field';
      const required = this.config.requiredFields.includes(field);

      if (field === 'preferredContact') {
        this._renderPreferredContact(wrapper);
        form.appendChild(wrapper);
        continue;
      }

      const label = document.createElement('label');
      label.className = 'lb-label';
      const inputId = `lb-field-${field}`;
      label.htmlFor = inputId;
      label.textContent = this._labelFor(field, locale) + (required ? ' *' : '');
      wrapper.appendChild(label);

      /** @type {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} */
      let input;
      if (field === 'message') {
        input = document.createElement('textarea');
        input.className = 'lb-textarea';
      } else if (field === 'service') {
        const select = document.createElement('select');
        select.className = 'lb-select';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = locale.servicePlaceholder;
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);
        for (const option of this.config.serviceOptions) {
          const opt = document.createElement('option');
          opt.value = option;
          opt.textContent = option;
          select.appendChild(opt);
        }
        input = select;
      } else {
        const textInput = document.createElement('input');
        textInput.type = field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text';
        textInput.className = 'lb-input';
        input = textInput;
      }

      input.id = inputId;
      input.name = field;
      if (required) input.setAttribute('aria-required', 'true');
      const errorId = `lb-error-${field}`;
      input.setAttribute('aria-describedby', errorId);
      input.setAttribute('aria-invalid', 'false');
      wrapper.appendChild(input);

      const errorEl = document.createElement('div');
      errorEl.className = 'lb-error';
      errorEl.id = errorId;
      wrapper.appendChild(errorEl);

      this.inputs[field] = input;
      this.errorEls[field] = errorEl;
      form.appendChild(wrapper);
    }
  }

  /**
   * @param {import('./config.js').LeadBoxFieldKey} field
   * @param {import('./locale.js').LeadBoxLocale} locale
   * @returns {string}
   */
  _labelFor(field, locale) {
    switch (field) {
      case 'name':
        return locale.nameLabel;
      case 'phone':
        return locale.phoneLabel;
      case 'email':
        return locale.emailLabel;
      case 'message':
        return locale.messageLabel;
      case 'service':
        return locale.serviceLabel;
      default:
        return field;
    }
  }

  /**
   * @param {HTMLDivElement} wrapper
   */
  _renderPreferredContact(wrapper) {
    const locale = this.config.locale;
    const label = document.createElement('span');
    label.className = 'lb-label';
    label.textContent = locale.preferredContactLabel;
    wrapper.appendChild(label);

    const group = document.createElement('div');
    group.className = 'lb-radio-group';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', locale.preferredContactLabel);

    /** @type {[string, string][]} */
    const options = [
      ['email', locale.preferredContactEmail],
      ['phone', locale.preferredContactPhone],
      ['text', locale.preferredContactText],
    ];

    /** @type {HTMLInputElement|null} */
    let firstRadio = null;
    for (const [value, text] of options) {
      const optionLabel = document.createElement('label');
      optionLabel.className = 'lb-radio-option';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'preferredContact';
      radio.value = value;
      if (!firstRadio) {
        firstRadio = radio;
      }
      optionLabel.appendChild(radio);
      const span = document.createElement('span');
      span.textContent = text;
      optionLabel.appendChild(span);
      group.appendChild(optionLabel);
    }
    if (firstRadio) {
      this.inputs.preferredContact = firstRadio;
    }
    wrapper.appendChild(group);
  }

  /**
   * A hidden field real users never see or fill in. Bots that auto-fill
   * every input on a form will fill this one too, which is how we catch
   * them without ever showing a CAPTCHA to a human.
   * @param {HTMLFormElement} form
   */
  _renderHoneypot(form) {
    const wrapper = document.createElement('div');
    wrapper.className = 'lb-hp-field';
    wrapper.setAttribute('aria-hidden', 'true');
    const label = document.createElement('label');
    label.htmlFor = 'lb-hp';
    label.textContent = 'Leave this field empty';
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'lb-hp';
    input.name = this.config.honeypotFieldName;
    input.tabIndex = -1;
    input.autocomplete = 'off';
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    form.appendChild(wrapper);
    this.honeypotInput = input;
  }

  /**
   * @param {HTMLDivElement} container
   */
  _renderSuccess(container) {
    const locale = this.config.locale;
    const message = document.createElement('p');
    message.className = 'lb-success-message';
    message.textContent = this.config.successMessage;
    container.appendChild(message);

    const actions = document.createElement('div');
    actions.className = 'lb-success-actions';

    if (this.config.bookingUrl) {
      const link = document.createElement('a');
      link.className = 'lb-success-link lb-primary';
      link.href = this.config.bookingUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = locale.bookingLinkText;
      actions.appendChild(link);
    }

    if (this.config.phone) {
      const callLink = document.createElement('a');
      callLink.className = 'lb-success-link';
      callLink.href = `tel:${this.config.phone.replace(/[^0-9+]/g, '')}`;
      callLink.textContent = locale.callLinkText;
      actions.appendChild(callLink);
    }

    container.appendChild(actions);
  }

  open() {
    if (!this.overlay || !this.dialogEl || this.isOpen) return;
    this.lastFocused = document.activeElement;
    this.overlay.hidden = false;
    this.isOpen = true;
    document.addEventListener('keydown', this._onKeydown, true);
    this.dialogEl.focus();
  }

  close() {
    if (!this.overlay || !this.isOpen) return;
    this.overlay.hidden = true;
    this.isOpen = false;
    document.removeEventListener('keydown', this._onKeydown, true);
    if (this.lastFocused instanceof HTMLElement) {
      this.lastFocused.focus();
    }
  }

  /** Remove the widget from the DOM and detach listeners. */
  destroy() {
    if (this.isOpen) {
      document.removeEventListener('keydown', this._onKeydown, true);
    }
    if (this.host && this.host.parentNode) {
      this.host.parentNode.removeChild(this.host);
    }
  }

  /**
   * @param {MouseEvent} event
   */
  _onOverlayClick(event) {
    if (event.target === this.overlay) {
      this.close();
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  _onKeydown(event) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.close();
      return;
    }
    if (event.key === 'Tab') {
      this._trapFocus(event);
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  _trapFocus(event) {
    if (!this.shadow || !this.dialogEl) return;
    const focusable = Array.from(this.dialogEl.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
      (el) => el instanceof HTMLElement && el.offsetParent !== null
    );
    if (focusable.length === 0) return;
    const first = /** @type {HTMLElement} */ (focusable[0]);
    const last = /** @type {HTMLElement} */ (focusable[focusable.length - 1]);
    const active = this.shadow.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * @param {SubmitEvent} event
   */
  async _onSubmit(event) {
    event.preventDefault();
    if (!this.form || !this.submitButton || !this.host) return;
    const host = this.host;

    if (this.formErrorEl) this.formErrorEl.textContent = '';
    for (const field of Object.keys(this.errorEls)) {
      this.errorEls[field].textContent = '';
      const input = this.inputs[field];
      if (input) input.setAttribute('aria-invalid', 'false');
    }

    /** @type {Object<string, string>} */
    const values = {};
    for (const field of this.config.fields) {
      if (field === 'preferredContact') {
        const checked = this.form.querySelector('input[name="preferredContact"]:checked');
        values.preferredContact = checked instanceof HTMLInputElement ? checked.value : '';
      } else {
        const input = this.inputs[field];
        values[field] = input ? input.value : '';
      }
    }

    const { valid, errors } = validateForm(
      this.config.fields,
      this.config.requiredFields,
      values,
      this.config.locale
    );

    if (!valid) {
      /** @type {HTMLElement|null} */
      let firstInvalid = null;
      for (const field of Object.keys(errors)) {
        const errorEl = this.errorEls[field];
        const input = this.inputs[field];
        if (errorEl) errorEl.textContent = errors[field];
        if (input) {
          input.setAttribute('aria-invalid', 'true');
          if (!firstInvalid) firstInvalid = input;
        }
      }
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const now = (this.deps.now || Date.now)();
    const spamResult = checkSpam({
      honeypotValue: this.honeypotInput ? this.honeypotInput.value : '',
      renderedAt: this.renderedAt,
      submittedAt: now,
      minSubmitMs: this.config.minSubmitMs,
    });

    const context = captureContext();
    const payload = /** @type {import('./submit.js').SubmitPayload} */ ({
      ...values,
      ...context,
      submittedAt: new Date(now).toISOString(),
    });

    emit(host, EVENTS.SUBMIT, { payload, spam: spamResult.isSpam });

    if (spamResult.isSpam) {
      if (this.config.debug) {
        console.warn('[leadbox] submission blocked as spam:', spamResult.reason);
      }
      this._showSuccess();
      return;
    }

    this.submitButton.disabled = true;
    this.submitButton.textContent = this.config.locale.submittingText;

    const result = await submitLead({
      endpoint: this.config.endpoint,
      method: this.config.method,
      encoding: this.config.encoding,
      payload,
      fetchImpl: this.deps.fetchImpl,
    });

    if (result.ok) {
      emit(host, EVENTS.SUCCESS, { payload, status: result.status });
      this._showSuccess();
    } else {
      emit(host, EVENTS.ERROR, { error: result.error, status: result.status });
      if (this.formErrorEl) this.formErrorEl.textContent = this.config.locale.errorMessage;
      this.submitButton.disabled = false;
      this.submitButton.textContent = this.config.locale.submitButtonText;
    }
  }

  _showSuccess() {
    if (this.form) this.form.hidden = true;
    if (this.successEl) {
      this.successEl.hidden = false;
      this.successEl.focus();
    }
  }
}
