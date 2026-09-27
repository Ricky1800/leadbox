// @ts-check
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LeadBoxWidget } from '../src/dialog.js';
import { normalizeConfig, mergeConfig } from '../src/config.js';
import { EVENTS } from '../src/events.js';

/**
 * @param {Partial<import('../src/config.js').LeadBoxConfig>} overrides
 * @param {{ fetchImpl?: typeof fetch, now?: () => number }} [deps]
 */
function makeWidget(overrides = {}, deps = {}) {
  const config = normalizeConfig(mergeConfig({ endpoint: 'https://example.com/leads' }, overrides));
  const widget = new LeadBoxWidget(config, deps);
  widget.mount(document.body);
  return widget;
}

describe('LeadBoxWidget mounting', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('mounts a shadow-DOM host with a trigger button', () => {
    const widget = makeWidget({ buttonText: 'Get a Quote' });
    expect(widget.host).not.toBeNull();
    expect(document.body.contains(widget.host)).toBe(true);
    expect(widget.trigger?.textContent).toBe('Get a Quote');
  });

  it('starts with the dialog overlay hidden', () => {
    const widget = makeWidget();
    expect(widget.overlay?.hidden).toBe(true);
    expect(widget.isOpen).toBe(false);
  });
});

describe('LeadBoxWidget open/close + a11y', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('open() reveals the dialog and sets role=dialog/aria-modal', () => {
    const widget = makeWidget();
    widget.open();
    expect(widget.overlay?.hidden).toBe(false);
    expect(widget.isOpen).toBe(true);
    expect(widget.dialogEl?.getAttribute('role')).toBe('dialog');
    expect(widget.dialogEl?.getAttribute('aria-modal')).toBe('true');
    expect(widget.dialogEl?.getAttribute('aria-labelledby')).toBe('lb-title');
  });

  it('Escape closes the dialog and restores focus to the trigger', () => {
    const widget = makeWidget();
    widget.trigger?.focus();
    widget.open();
    expect(widget.isOpen).toBe(true);

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escEvent);

    expect(widget.isOpen).toBe(false);
    expect(widget.overlay?.hidden).toBe(true);
    expect(document.activeElement).toBe(widget.host);
  });

  it('close() is a no-op when already closed', () => {
    const widget = makeWidget();
    expect(() => widget.close()).not.toThrow();
    expect(widget.isOpen).toBe(false);
  });

  it('clicking the overlay backdrop (not the dialog) closes it', () => {
    const widget = makeWidget();
    widget.open();
    const overlay = /** @type {HTMLDivElement} */ (widget.overlay);
    overlay.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(widget.isOpen).toBe(false);
  });

  it('Tab wraps from the last focusable element back to the first', () => {
    const widget = makeWidget({ fields: ['name'], requiredFields: [] });
    widget.open();
    const focusable = /** @type {HTMLElement[]} */ (
      Array.from(widget.dialogEl?.querySelectorAll('button, input, select, textarea') || [])
    );
    const last = focusable[focusable.length - 1];
    last.focus();
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(true);
  });
});

describe('LeadBoxWidget submission', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('validates required fields and blocks submission when empty', async () => {
    const fetchImpl = vi.fn();
    const widget = makeWidget({ fields: ['name', 'email'], requiredFields: ['name', 'email'] }, {
      fetchImpl,
    });
    widget.open();
    await widget._onSubmit(new Event('submit', { cancelable: true }));
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(widget.errorEls.name.textContent).toBeTruthy();
    expect(widget.inputs.name.getAttribute('aria-invalid')).toBe('true');
  });

  it('submits successfully and dispatches leadbox:submit + leadbox:success', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const widget = makeWidget({ fields: ['name', 'email'], requiredFields: ['name'] }, {
      fetchImpl,
      now: () => 100000,
    });
    widget.renderedAt = 0;
    widget.open();
    widget.inputs.name.value = 'Jane Doe';
    widget.inputs.email.value = 'jane@example.com';

    const submitEvents = [];
    const successEvents = [];
    widget.host?.addEventListener(EVENTS.SUBMIT, (e) => submitEvents.push(/** @type {any} */ (e).detail));
    widget.host?.addEventListener(EVENTS.SUCCESS, (e) => successEvents.push(/** @type {any} */ (e).detail));

    await widget._onSubmit(new Event('submit', { cancelable: true }));

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(submitEvents).toHaveLength(1);
    expect(submitEvents[0].payload.name).toBe('Jane Doe');
    expect(successEvents).toHaveLength(1);
    expect(widget.successEl?.hidden).toBe(false);
    expect(widget.form?.hidden).toBe(true);
  });

  it('shows a friendly error and dispatches leadbox:error on failure', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const widget = makeWidget({ fields: ['name'], requiredFields: ['name'] }, {
      fetchImpl,
      now: () => 100000,
    });
    widget.renderedAt = 0;
    widget.open();
    widget.inputs.name.value = 'Jane Doe';

    const errorEvents = [];
    widget.host?.addEventListener(EVENTS.ERROR, (e) => errorEvents.push(/** @type {any} */ (e).detail));

    await widget._onSubmit(new Event('submit', { cancelable: true }));

    expect(errorEvents).toHaveLength(1);
    expect(widget.formErrorEl?.textContent).toBeTruthy();
    expect(widget.submitButton?.disabled).toBe(false);
  });

  it('blocks network submission when the honeypot field is filled in', async () => {
    const fetchImpl = vi.fn();
    const widget = makeWidget({ fields: ['name'], requiredFields: ['name'] }, {
      fetchImpl,
      now: () => 100000,
    });
    widget.renderedAt = 0;
    widget.open();
    widget.inputs.name.value = 'Jane Doe';
    /** @type {HTMLInputElement} */ (widget.honeypotInput).value = 'im-a-bot';

    await widget._onSubmit(new Event('submit', { cancelable: true }));

    expect(fetchImpl).not.toHaveBeenCalled();
    // Bots are shown a fake "success" so they don't learn they were caught.
    expect(widget.successEl?.hidden).toBe(false);
  });

  it('blocks network submission when submitted faster than minSubmitMs', async () => {
    const fetchImpl = vi.fn();
    const widget = makeWidget(
      { fields: ['name'], requiredFields: ['name'], minSubmitMs: 5000 },
      { fetchImpl, now: () => 1000 }
    );
    widget.renderedAt = 500; // only 500ms have "elapsed"
    widget.open();
    widget.inputs.name.value = 'Jane Doe';

    await widget._onSubmit(new Event('submit', { cancelable: true }));

    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
