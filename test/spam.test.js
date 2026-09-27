// @ts-check
import { describe, it, expect } from 'vitest';
import { checkSpam } from '../src/spam.js';

describe('checkSpam', () => {
  it('flags a filled-in honeypot as spam', () => {
    const result = checkSpam({
      honeypotValue: 'im-a-bot',
      renderedAt: 0,
      submittedAt: 10000,
      minSubmitMs: 1500,
    });
    expect(result.isSpam).toBe(true);
    expect(result.reason).toBe('honeypot');
  });

  it('flags a submission that happens faster than the minimum time', () => {
    const result = checkSpam({
      honeypotValue: '',
      renderedAt: 1000,
      submittedAt: 1200,
      minSubmitMs: 1500,
    });
    expect(result.isSpam).toBe(true);
    expect(result.reason).toBe('too-fast');
  });

  it('passes a normal human-paced, empty-honeypot submission', () => {
    const result = checkSpam({
      honeypotValue: '',
      renderedAt: 1000,
      submittedAt: 8000,
      minSubmitMs: 1500,
    });
    expect(result.isSpam).toBe(false);
    expect(result.reason).toBe(null);
  });

  it('treats whitespace-only honeypot values as empty', () => {
    const result = checkSpam({
      honeypotValue: '   ',
      renderedAt: 0,
      submittedAt: 5000,
      minSubmitMs: 1500,
    });
    expect(result.isSpam).toBe(false);
  });

  it('checks honeypot before timing', () => {
    const result = checkSpam({
      honeypotValue: 'bot',
      renderedAt: 0,
      submittedAt: 5000,
      minSubmitMs: 1500,
    });
    expect(result.reason).toBe('honeypot');
  });
});
