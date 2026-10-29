import linksData from '$lib/data/links.json';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { hideStuff } = await parent();
  if (hideStuff) return;

  const firstSection = linksData.sections[0];
  throw redirect(307, `/${ firstSection.id }`);
};
