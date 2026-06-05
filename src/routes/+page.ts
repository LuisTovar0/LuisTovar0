import linksData from '$lib/data/links.json';
import { redirect } from '@sveltejs/kit';

export const load = () => {
  const firstSection = linksData.sections[0];
  throw redirect(308, `/${ firstSection.id }`);
};
