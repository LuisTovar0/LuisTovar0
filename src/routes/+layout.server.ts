import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

// HIDE_SECTIONS lists the links.json section indices to hide, written as a JSON
// array ("[0, 2]") or a comma-separated list ("0, 2"). Malformed values are
// ignored so a typo cannot take the site down.
const parseHiddenSections = (value: string | undefined): number[] => {
  const trimmed = value?.trim();
  if (!trimmed) return [];

  let entries: unknown[];
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) return [];
      entries = parsed;
    } catch {
      return [];
    }
  } else {
    entries = trimmed.split(',');
  }

  const indices = entries
      .map((entry) => String(entry).trim())
      .filter((entry) => entry !== '')
      .map(Number)
      .filter((index) => Number.isInteger(index) && index >= 0);
  return [ ...new Set(indices) ];
};

export const load: LayoutServerLoad = () => ({
  hiddenSections: parseHiddenSections(env.HIDE_SECTIONS),
});
