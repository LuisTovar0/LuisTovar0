import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/** Supported locales. The first entry is the default / fallback. */
export const locales = ['en', 'pt', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = locales[0];

/** Short label shown on the language switcher (until it becomes an icon). */
export const localeLabels: Record<Locale, string> = {
    en: 'EN',
    pt: 'PT',
    ko: '한'
};

/**
 * A value that may be a single string (same in every language, e.g. a brand
 * name) or a per-locale map. This keeps `links.json` minimal: only the strings
 * that actually differ between languages need a map.
 */
export type Translatable = string | Partial<Record<Locale, string>>;

/** Resolve a {@link Translatable} for the given locale, falling back gracefully. */
export function t(value: Translatable | undefined | null, locale: Locale): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[locale] ?? value[defaultLocale] ?? Object.values(value)[0] ?? '';
}

function isLocale(value: string | null): value is Locale {
    return value != null && (locales as readonly string[]).includes(value);
}

function detectLocale(): Locale {
    if (!browser) return defaultLocale;

    const saved = localStorage.getItem('locale');
    if (isLocale(saved)) return saved;

    const nav = navigator.language?.slice(0, 2).toLowerCase() ?? '';
    if (isLocale(nav)) return nav;

    return defaultLocale;
}

export const locale = writable<Locale>(defaultLocale);

// Persist + reflect onto <html lang>, but only after `initLocale()` has read the
// saved value — otherwise the store's initial `defaultLocale` would overwrite it.
let persist = false;
locale.subscribe((value) => {
    if (!browser || !persist) return;
    localStorage.setItem('locale', value);
    document.documentElement.lang = value;
});

/**
 * Resolve and apply the user's preferred locale. Call once from the browser
 * (e.g. in the root layout's `onMount`) so SSR and first paint stay on the
 * default locale and hydration matches.
 */
export function initLocale() {
    if (!browser) return;
    const detected = detectLocale();
    persist = true;
    locale.set(detected);
    document.documentElement.lang = detected;
}

/** Advance to the next locale in {@link locales}, wrapping around. */
export function cycleLocale() {
    locale.update((current) => {
        const next = (locales.indexOf(current) + 1) % locales.length;
        return locales[next];
    });
}
