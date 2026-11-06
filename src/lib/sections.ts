import linksData from "$lib/data/links.json";

/** Sections of `links.json` whose index is not listed in HIDE_SECTIONS. */
export function visibleSections(hiddenIndices: number[]) {
  return linksData.sections.filter((_, index) => !hiddenIndices.includes(index));
}
