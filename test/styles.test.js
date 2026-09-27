// @ts-check
import { describe, it, expect } from 'vitest';
import { getStyles } from '../src/styles.js';
import { normalizeConfig, mergeConfig } from '../src/config.js';
import { THEME_NAMES, THEMES } from '../src/themes.js';

/**
 * @param {Partial<import('../src/config.js').LeadBoxConfig>} overrides
 */
function configFor(overrides) {
  return normalizeConfig(mergeConfig({ endpoint: 'https://example.com' }, overrides));
}

describe('getStyles', () => {
  it('renders every theme without throwing and includes its accent color', () => {
    for (const name of THEME_NAMES) {
      const css = getStyles(configFor({ theme: name }));
      expect(css).toContain(`--leadbox-accent: ${THEMES[name].light.accent}`);
      expect(css).toContain(`--leadbox-font: ${THEMES[name].light.font}`);
    }
  });

  it('wraps dark tokens in a prefers-color-scheme query by default (auto)', () => {
    const css = getStyles(configFor({ theme: 'clinic' }));
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(`--leadbox-bg: ${THEMES.clinic.dark.bg}`);
  });

  it('applies dark tokens unconditionally when colorScheme is "dark"', () => {
    const css = getStyles(configFor({ theme: 'salon', colorScheme: 'dark' }));
    expect(css).not.toContain('@media (prefers-color-scheme: dark)');
    expect(css).toContain(`--leadbox-bg: ${THEMES.salon.dark.bg}`);
  });

  it('omits any dark-mode block when colorScheme is "light"', () => {
    const css = getStyles(configFor({ theme: 'salon', colorScheme: 'light' }));
    expect(css).not.toContain('prefers-color-scheme');
  });

  it('lets accentColor override the theme accent as a single-token escape hatch', () => {
    const css = getStyles(configFor({ theme: 'trades', accentColor: '#ff00ff' }));
    expect(css).toContain('--leadbox-accent: #ff00ff;');
  });

  it('respects the configured trigger position', () => {
    const css = getStyles(configFor({ position: 'top-left' }));
    expect(css).toContain('top: 20px; left: 20px;');
  });

  it('gates the pop-in and success-check draw animations behind reduced-motion', () => {
    const css = getStyles(configFor({}));
    const idx = css.indexOf('@media (prefers-reduced-motion: no-preference)');
    expect(idx).toBeGreaterThan(-1);
    expect(css.slice(idx)).toContain('lb-success-check circle');
    expect(css.slice(idx)).toContain('lb-draw');
  });
});
