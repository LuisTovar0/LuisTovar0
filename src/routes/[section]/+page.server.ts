import linksData from '$lib/data/links.json';
import { visibleSections } from '$lib/sections';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
  const { hiddenSections } = await parent();

  // With fewer than two visible sections there is no navigation and everything
  // lives at `/`.
  if (visibleSections(hiddenSections).length < 2) redirect(307, '/');

  // Hidden sections are unreachable; their URLs redirect to `/`.
  const index = linksData.sections.findIndex((section) => section.id === params.section);
  if (index !== -1 && hiddenSections.includes(index)) redirect(307, '/');
};
