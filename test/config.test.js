// @ts-check
import { describe, it, expect } from 'vitest';
import { parseDataAttributes, mergeConfig, normalizeConfig, DEFAULTS } from '../src/config.js';

/**
 * @param {Object<string, string>} attrs
 * @returns {HTMLElement}
 */
function elWithData(attrs) {
  const el = document.createElement('script');
  for (const key of Object.keys(attrs)) {
    el.setAttribute(key, attrs[key]);
  }
  return el;
}

describe('parseDataAttributes', () => {
  it('returns an empty object for a null/missing element', () => {
    expect(parseDataAttributes(null)).toEqual({});
    expect(parseDataAttributes(undefined)).toEqual({});
  });

  it('reads simple string attributes', () => {
    const el = elWithData({
      'data-endpoint': 'https://example.com/leads',
      'data-title': 'Custom Title',
      'data-subtitle': 'Custom Subtitle',
      'data-button-text': 'Quote Me',
    });
    const config = parseDataAttributes(el);
    expect(config.endpoint).toBe('https://example.com/leads');
    expect(config.title).toBe('Custom Title');
    expect(config.subtitle).toBe('Custom Subtitle');
    expect(config.buttonText).toBe('Quote Me');
  });

  it('uppercases the method', () => {
    const el = elWithData({ 'data-method': 'post' });
    expect(parseDataAttributes(el).method).toBe('POST');
  });

  it('only accepts known encodings', () => {
    expect(parseDataAttributes(elWithData({ 'data-encoding': 'json' })).encoding).toBe('json');
    expect(parseDataAttributes(elWithData({ 'data-encoding': 'form' })).encoding).toBe('form');
    expect(parseDataAttributes(elWithData({ 'data-encoding': 'xml' })).encoding).toBeUndefined();
  });

  it('only accepts known positions', () => {
    expect(parseDataAttributes(elWithData({ 'data-position': 'top-left' })).position).toBe(
      'top-left'
    );
    expect(
      parseDataAttributes(elWithData({ 'data-position': 'middle' })).position
    ).toBeUndefined();
  });

  it('splits comma-separated lists and trims whitespace', () => {
    const el = elWithData({
      'data-fields': 'name, phone,  email ,message',
      'data-required-fields': 'name,email',
      'data-service-options': 'Web Design, SEO ,Hosting',
    });
    const config = parseDataAttributes(el);
    expect(config.fields).toEqual(['name', 'phone', 'email', 'message']);
    expect(config.requiredFields).toEqual(['name', 'email']);
    expect(config.serviceOptions).toEqual(['Web Design', 'SEO', 'Hosting']);
  });

  it('drops unknown field keys', () => {
    const el = elWithData({ 'data-fields': 'name,bogus,email' });
    expect(parseDataAttributes(el).fields).toEqual(['name', 'email']);
  });

  it('parses boolean-ish debug flag', () => {
    expect(parseDataAttributes(elWithData({ 'data-debug': 'true' })).debug).toBe(true);
    expect(parseDataAttributes(elWithData({ 'data-debug': 'false' })).debug).toBe(false);
    expect(parseDataAttributes(elWithData({ 'data-debug': '1' })).debug).toBe(true);
  });

  it('parses numeric minSubmitMs', () => {
    expect(parseDataAttributes(elWithData({ 'data-min-submit-ms': '2000' })).minSubmitMs).toBe(
      2000
    );
  });

  it('collects locale overrides from data-locale-* attributes', () => {
    const el = elWithData({
      'data-locale-success-message': 'Gracias!',
      'data-locale-submit-button-text': 'Enviar',
    });
    const config = parseDataAttributes(el);
    expect(config.locale).toEqual({
      successMessage: 'Gracias!',
      submitButtonText: 'Enviar',
    });
  });
});

describe('mergeConfig', () => {
  it('applies layers in order, later wins', () => {
    const merged = mergeConfig({ title: 'From data attrs' }, { title: 'From init()' });
    expect(merged.title).toBe('From init()');
  });

  it('falls back to defaults for unset keys', () => {
    const merged = mergeConfig({ title: 'Only title' });
    expect(merged.endpoint).toBe(DEFAULTS.endpoint);
    expect(merged.position).toBe(DEFAULTS.position);
  });

  it('merges locale key-by-key instead of replacing wholesale', () => {
    const merged = mergeConfig(
      { locale: { successMessage: 'From data' } },
      { locale: { submitButtonText: 'From init' } }
    );
    expect(merged.locale.successMessage).toBe('From data');
    expect(merged.locale.submitButtonText).toBe('From init');
    // Untouched locale keys still have their default value.
    expect(merged.locale.errorMessage).toBe(DEFAULTS.locale.errorMessage);
  });

  it('ignores null/undefined layers', () => {
    expect(() => mergeConfig(undefined, { title: 'x' }, null)).not.toThrow();
  });
});

describe('normalizeConfig', () => {
  it('falls back to default fields when the list is empty', () => {
    const normalized = normalizeConfig(mergeConfig({ fields: [] }));
    expect(normalized.fields).toEqual(DEFAULTS.fields);
  });

  it('drops required fields that are not in the fields list', () => {
    const normalized = normalizeConfig(
      mergeConfig({ fields: ['name', 'email'], requiredFields: ['name', 'phone'] })
    );
    expect(normalized.requiredFields).toEqual(['name']);
  });

  it('resets an invalid position/encoding to defaults', () => {
    const normalized = normalizeConfig(
      mergeConfig({
        position: /** @type {any} */ ('nowhere'),
        encoding: /** @type {any} */ ('xml'),
      })
    );
    expect(normalized.position).toBe(DEFAULTS.position);
    expect(normalized.encoding).toBe(DEFAULTS.encoding);
  });

  it('clamps a negative or non-finite minSubmitMs back to the default', () => {
    expect(normalizeConfig(mergeConfig({ minSubmitMs: -5 })).minSubmitMs).toBe(
      DEFAULTS.minSubmitMs
    );
    expect(normalizeConfig(mergeConfig({ minSubmitMs: NaN })).minSubmitMs).toBe(
      DEFAULTS.minSubmitMs
    );
  });
});
