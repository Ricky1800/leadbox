// @ts-check
import { describe, it, expect } from 'vitest';
import { captureContext } from '../src/utm.js';

/**
 * @param {string} href
 * @returns {Location}
 */
function fakeLocation(href) {
  return /** @type {Location} */ (new URL(href));
}

describe('captureContext', () => {
  it('captures the page URL and referrer', () => {
    const context = captureContext(fakeLocation('https://biz.example.com/?'), 'https://google.com/');
    expect(context.pageUrl).toBe('https://biz.example.com/?');
    expect(context.referrer).toBe('https://google.com/');
  });

  it('captures known UTM params and omits absent ones', () => {
    const context = captureContext(
      fakeLocation('https://biz.example.com/?utm_source=google&utm_medium=cpc'),
      ''
    );
    expect(context.utm_source).toBe('google');
    expect(context.utm_medium).toBe('cpc');
    expect(context.utm_campaign).toBeUndefined();
  });

  it('ignores non-UTM query params', () => {
    const context = captureContext(fakeLocation('https://biz.example.com/?foo=bar'), '');
    expect(context.foo).toBeUndefined();
  });

  it('defaults referrer to an empty string when absent', () => {
    const context = captureContext(fakeLocation('https://biz.example.com/'), '');
    expect(context.referrer).toBe('');
  });
});
