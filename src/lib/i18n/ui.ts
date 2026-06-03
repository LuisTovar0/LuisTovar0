import type { Locale } from './index';
import { defaultLocale } from './index';

/**
 * Interface chrome strings — everything that isn't content from `links.json`.
 * Keys ending in `_a11y` are accessible names (aria-labels) for icon-only or
 * ambiguous controls, kept here so they're translated alongside their labels.
 */
const strings = {
    en: {
        notFoundTitle: 'Section not found',
        notFoundLink: 'Go back home',
        theme_a11y_toLight: 'Switch to light mode',
        theme_a11y_toDark: 'Switch to dark mode',
        language_a11y: 'Change language'
    },
    pt: {
        notFoundTitle: 'Secção não encontrada',
        notFoundLink: 'Voltar ao início',
        theme_a11y_toLight: 'Mudar para o modo claro',
        theme_a11y_toDark: 'Mudar para o modo escuro',
        language_a11y: 'Mudar de idioma'
    },
    ko: {
        notFoundTitle: '섹션을 찾을 수 없습니다',
        notFoundLink: '홈으로 돌아가기',
        theme_a11y_toLight: '라이트 모드로 전환',
        theme_a11y_toDark: '다크 모드로 전환',
        language_a11y: '언어 변경'
    }
} satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof (typeof strings)[typeof defaultLocale];

/** Translate an interface string for the given locale. */
export function ui(key: UiKey, locale: Locale): string {
    return strings[locale]?.[key] ?? strings[defaultLocale][key];
}
