// @ts-check
import { describe, it, expect } from 'vitest';
import {
  THEMES,
  THEME_NAMES,
  DEFAULT_THEME_NAME,
  isValidTheme,
  resolveThemeName,
  resolveThemeTokens,
} from '../src/themes.js';

const REQUIRED_TOKEN_KEYS = [
  'accent',
  'accentInk',
  'bg',
  'ink',
  'muted',
  'border',
  'error',
  'success',
  'radius',
  'radiusSm',
  'font',
  'shadowTrigger',
  'shadowDialog',
];

describe('THEMES', () => {
  it('ships the default preset plus at least six verticals', () => {
    expect(THEME_NAMES).toContain('default');
    // default + salon/trades/restaurant/clinic/auto/professional = 7
    expect(THEME_NAMES.length).toBeGreaterThanOrEqual(7);
  });

  it('every theme defines a complete, non-empty light token set', () => {
    for (const name of THEME_NAMES) {
      const tokens = THEMES[name].light;
      for (const key of REQUIRED_TOKEN_KEYS) {
        expect(tokens[key], `${name}.light.${key}`).toBeTruthy();
      }
    }
  });

  it('every theme is visually distinct from default on at least accent or font', () => {
    const base = THEMES.default.light;
    for (const name of THEME_NAMES) {
      if (name === 'default') continue;
      const tokens = THEMES[name].light;
      const differs = tokens.accent !== base.accent || tokens.font !== base.font;
      expect(differs, `${name} should differ from default`).toBe(true);
    }
  });
});

describe('isValidTheme / resolveThemeName', () => {
  it('accepts known theme names and rejects unknown ones', () => {
    expect(isValidTheme('salon')).toBe(true);
    expect(isValidTheme('does-not-exist')).toBe(false);
    expect(isValidTheme(undefined)).toBe(false);
    expect(isValidTheme(null)).toBe(false);
  });

  it('falls back an unknown theme name to the default', () => {
    expect(resolveThemeName('bogus')).toBe(DEFAULT_THEME_NAME);
    expect(resolveThemeName(undefined)).toBe(DEFAULT_THEME_NAME);
    expect(resolveThemeName('clinic')).toBe('clinic');
  });
});

describe('resolveThemeTokens', () => {
  it('resolves light tokens for a known theme', () => {
    const tokens = resolveThemeTokens('trades', 'light');
    expect(tokens.accent).toBe(THEMES.trades.light.accent);
    expect(tokens.font).toBe(THEMES.trades.light.font);
  });

  it('falls back to default for an unknown theme name', () => {
    const tokens = resolveThemeTokens('nonexistent', 'light');
    expect(tokens).toEqual(THEMES.default.light);
  });

  it('layers dark overrides on top of light tokens without losing unset keys', () => {
    const dark = resolveThemeTokens('salon', 'dark');
    // Overridden in salon.dark:
    expect(dark.bg).toBe(THEMES.salon.dark.bg);
    // Not overridden in salon.dark, should still carry through from light:
    expect(dark.accent).toBe(THEMES.salon.light.accent);
    expect(dark.radius).toBe(THEMES.salon.light.radius);
  });

  it('falls back to the default theme dark overrides for keys a preset does not override', () => {
    const dark = resolveThemeTokens('trades', 'dark');
    // trades.dark only overrides bg/ink/muted/border; shadowDialog should
    // come from THEMES.default.dark since trades.dark doesn't set it.
    expect(dark.shadowDialog).toBe(THEMES.default.dark.shadowDialog);
  });

  it('every theme resolves to a fully-specified, distinct-colored dark token set', () => {
    for (const name of THEME_NAMES) {
      const dark = resolveThemeTokens(name, 'dark');
      for (const key of REQUIRED_TOKEN_KEYS) {
        expect(dark[key], `${name}.dark.${key}`).toBeTruthy();
      }
      expect(dark.bg).not.toBe(dark.ink);
    }
  });
});
