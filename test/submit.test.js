// @ts-check
import { describe, it, expect, vi } from 'vitest';
import { encodePayload, submitLead } from '../src/submit.js';

/** @type {import('../src/submit.js').SubmitPayload} */
const samplePayload = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  pageUrl: 'https://biz.example.com/',
  referrer: '',
  submittedAt: '2026-01-01T00:00:00.000Z',
};

describe('encodePayload', () => {
  it('encodes as JSON with the right content type', () => {
    const { body, headers } = encodePayload('json', samplePayload);
    expect(headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(body)).toEqual(samplePayload);
  });

  it('encodes as application/x-www-form-urlencoded', () => {
    const { body, headers } = encodePayload('form', samplePayload);
    expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    const params = new URLSearchParams(body);
    expect(params.get('name')).toBe('Jane Doe');
    expect(params.get('email')).toBe('jane@example.com');
  });

  it('omits undefined/null values when form-encoding', () => {
    const { body } = encodePayload('form', /** @type {any} */ ({ ...samplePayload, service: undefined }));
    expect(body.includes('service=')).toBe(false);
  });
});

describe('submitLead', () => {
  it('resolves ok:true on a 2xx response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    const result = await submitLead({
      endpoint: 'https://example.com/leads',
      method: 'POST',
      encoding: 'json',
      payload: samplePayload,
      fetchImpl,
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.com/leads',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('resolves ok:false with the status on a non-2xx response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const result = await submitLead({
      endpoint: 'https://example.com/leads',
      method: 'POST',
      encoding: 'json',
      payload: samplePayload,
      fetchImpl,
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
    expect(result.error).toMatch(/500/);
  });

  it('resolves ok:false with a friendly error on a network failure', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const result = await submitLead({
      endpoint: 'https://example.com/leads',
      method: 'POST',
      encoding: 'json',
      payload: samplePayload,
      fetchImpl,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Failed to fetch');
  });

  it('resolves ok:false without making a request when no endpoint is configured', async () => {
    const fetchImpl = vi.fn();
    const result = await submitLead({
      endpoint: '',
      method: 'POST',
      encoding: 'json',
      payload: samplePayload,
      fetchImpl,
    });
    expect(result.ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
