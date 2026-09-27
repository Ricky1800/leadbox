// @ts-check
import { describe, it, expect } from 'vitest';
import { validateField, validateForm, EMAIL_RE, PHONE_RE } from '../src/validate.js';
import { DEFAULT_LOCALE } from '../src/locale.js';

describe('EMAIL_RE / PHONE_RE', () => {
  it('accepts common valid emails', () => {
    expect(EMAIL_RE.test('a@b.co')).toBe(true);
    expect(EMAIL_RE.test('first.last+tag@sub.example.com')).toBe(true);
  });

  it('rejects obviously invalid emails', () => {
    expect(EMAIL_RE.test('not-an-email')).toBe(false);
    expect(EMAIL_RE.test('a@b')).toBe(false);
    expect(EMAIL_RE.test('@b.com')).toBe(false);
  });

  it('accepts common phone formats', () => {
    expect(PHONE_RE.test('(908) 555-1234')).toBe(true);
    expect(PHONE_RE.test('+1 908 555 1234')).toBe(true);
    expect(PHONE_RE.test('9085551234')).toBe(true);
  });

  it('rejects too-short or letter-containing phone numbers', () => {
    expect(PHONE_RE.test('12345')).toBe(false);
    expect(PHONE_RE.test('call-me-maybe')).toBe(false);
  });
});

describe('validateField', () => {
  it('flags a required empty field', () => {
    const result = validateField('name', '', true, DEFAULT_LOCALE);
    expect(result.valid).toBe(false);
    expect(result.message).toBe(DEFAULT_LOCALE.requiredError);
  });

  it('allows an optional empty field', () => {
    const result = validateField('message', '', false, DEFAULT_LOCALE);
    expect(result.valid).toBe(true);
  });

  it('validates email format only when non-empty', () => {
    expect(validateField('email', 'bad', true, DEFAULT_LOCALE).valid).toBe(false);
    expect(validateField('email', 'good@example.com', true, DEFAULT_LOCALE).valid).toBe(true);
  });

  it('validates phone format only when non-empty', () => {
    expect(validateField('phone', '123', true, DEFAULT_LOCALE).valid).toBe(false);
    expect(validateField('phone', '908-555-1234', true, DEFAULT_LOCALE).valid).toBe(true);
  });

  it('trims whitespace before checking emptiness', () => {
    expect(validateField('name', '   ', true, DEFAULT_LOCALE).valid).toBe(false);
  });
});

describe('validateForm', () => {
  it('reports no errors when every required field is present and valid', () => {
    const result = validateForm(
      ['name', 'email'],
      ['name', 'email'],
      { name: 'Jane', email: 'jane@example.com' },
      DEFAULT_LOCALE
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('collects one error per invalid field', () => {
    const result = validateForm(
      ['name', 'email', 'phone'],
      ['name', 'email', 'phone'],
      { name: '', email: 'nope', phone: '1' },
      DEFAULT_LOCALE
    );
    expect(result.valid).toBe(false);
    expect(Object.keys(result.errors)).toEqual(['name', 'email', 'phone']);
  });

  it('skips the preferredContact field entirely (radio group, not free text)', () => {
    const result = validateForm(
      ['preferredContact'],
      ['preferredContact'],
      { preferredContact: '' },
      DEFAULT_LOCALE
    );
    expect(result.valid).toBe(true);
  });
});
