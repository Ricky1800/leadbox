// @ts-check
import { describe, it, expect, vi, afterEach } from 'vitest';
import { init, open, close, destroy, getInstance } from '../src/index.js';

/**
 * @param {Object<string, string>} attrs
 */
function fakeScriptEl(attrs) {
  const el = document.createElement('script');
  for (const key of Object.keys(attrs)) el.setAttribute(key, attrs[key]);
  return el;
}

describe('LeadBox public API', () => {
  afterEach(() => {
    destroy();
    document.body.innerHTML = '';
  });

  it('init() merges data-* attributes with init() options, init() wins', () => {
    const scriptEl = fakeScriptEl({ 'data-endpoint': 'https://from-data.example.com', 'data-title': 'From Data' });
    const widget = init({ title: 'From Init' }, { scriptEl });
    expect(widget.config.endpoint).toBe('https://from-data.example.com');
    expect(widget.config.title).toBe('From Init');
  });

  it('mounts exactly one widget and open()/close() control it', () => {
    const scriptEl = fakeScriptEl({ 'data-endpoint': 'https://example.com' });
    init({}, { scriptEl });
    expect(document.querySelectorAll('#leadbox-root').length).toBe(1);

    open();
    expect(getInstance()?.isOpen).toBe(true);
    close();
    expect(getInstance()?.isOpen).toBe(false);
  });

  it('re-calling init() tears down the previous widget instead of stacking them', () => {
    const scriptEl = fakeScriptEl({ 'data-endpoint': 'https://example.com' });
    init({}, { scriptEl });
    init({}, { scriptEl });
    expect(document.querySelectorAll('#leadbox-root').length).toBe(1);
  });

  it('open()/close() are safe no-ops before init() has been called', () => {
    destroy();
    expect(() => open()).not.toThrow();
    expect(() => close()).not.toThrow();
  });

  it('injects a fetchImpl through to the widget for testable submissions', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const scriptEl = fakeScriptEl({ 'data-endpoint': 'https://example.com', 'data-fields': 'name', 'data-required-fields': '' });
    const widget = init({}, { scriptEl, fetchImpl, now: () => 999999 });
    widget.renderedAt = 0;
    widget.open();
    widget.inputs.name.value = 'Jane';
    await widget._onSubmit(new Event('submit', { cancelable: true }));
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
