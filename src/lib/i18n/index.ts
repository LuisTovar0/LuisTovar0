import { browser } from '$app/environment';
import { writable } from 'svelte/store';

/** Supported locales. */
export const locales = [ 'pt', 'en', 'ko' ] as const;
export type Locale = (typeof locales)[number];
/** The default / fallback locale. The site always starts in Portuguese. */
export const defaultLocale: Locale = 'pt';

/** Short label shown on the language switcher (until it becomes an icon). */
export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  pt: 'PT',
  ko: '한',
};

/**
 * A value that may be a single string (same in every language, e.g. a brand
 * name) or a per-locale map. This keeps `links.json` minimal: only the strings
 * that actually differ between languages need a map.
 */
export type Translatable = string | Partial<Record<Locale, string>>;

/** Resolve a {@link Translatable} for the given locale, falling back gracefully. */
export function t(value: Translatable | undefined | null, locale: Locale): string {
  if (value == null)
    return '';
  if (typeof value === 'string')
    return value;
  return value[locale] ?? value[defaultLocale] ?? Object.values(value)[0] ?? '';
}

export const locale = writable<Locale>(defaultLocale);

// Reflect onto <html lang>, but only after `initLocale()` has run.
let initialized = false;
locale.subscribe((value) => {
  if (!browser || !initialized)
    return;
  document.documentElement.lang = value;
});

/**
 * Reset the locale to the default (Portuguese) on every startup. There is no
 * persistence or browser-language auto-detection: the site always starts in
 * Portuguese and only switches when the visitor explicitly picks another
 * language for the duration of the current session.
 */
export function initLocale() {
  if (!browser)
    return;
  initialized = true;
  locale.set(defaultLocale);
  document.documentElement.lang = defaultLocale;
}

/** Advance to the next locale in {@link locales}, wrapping around. */
export function cycleLocale() {
  locale.update((current) => {
    const next = (locales.indexOf(current) + 1) % locales.length;
    return locales[next];
  });
}
