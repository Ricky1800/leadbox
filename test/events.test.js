// @ts-check
import { describe, it, expect, vi } from 'vitest';
import { emit, EVENTS } from '../src/events.js';

describe('emit', () => {
  it('dispatches a CustomEvent with the given name and detail', () => {
    const target = document.createElement('div');
    const handler = vi.fn();
    target.addEventListener(EVENTS.SUBMIT, handler);

    emit(target, EVENTS.SUBMIT, { foo: 'bar' });

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0];
    expect(event.detail).toEqual({ foo: 'bar' });
  });

  it('exposes the three documented event names', () => {
    expect(EVENTS.SUBMIT).toBe('leadbox:submit');
    expect(EVENTS.SUCCESS).toBe('leadbox:success');
    expect(EVENTS.ERROR).toBe('leadbox:error');
  });

  it('bubbles so a listener on an ancestor still receives it', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    document.body.appendChild(parent);

    const handler = vi.fn();
    parent.addEventListener(EVENTS.SUCCESS, handler);
    emit(child, EVENTS.SUCCESS, { ok: true });

    expect(handler).toHaveBeenCalledTimes(1);
    parent.remove();
  });
});
