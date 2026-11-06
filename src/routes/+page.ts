import { visibleSections } from '$lib/sections';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { hiddenSections } = await parent();
  const sections = visibleSections(hiddenSections);
  const [ firstSection ] = sections;

  // With a single visible section the nav is gone and its links are rendered
  // right here at `/`; otherwise send visitors to the first visible section.
  if (sections.length < 2) return { sectionId: firstSection?.id };

  throw redirect(307, `/${ firstSection.id }`);
};
