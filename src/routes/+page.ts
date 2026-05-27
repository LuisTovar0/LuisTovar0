import { redirect } from '@sveltejs/kit';
import linksData from '$lib/data/links.json';

export const load = () => {
    const firstSection = linksData.sections[0];
    throw redirect(307, `/${firstSection.id}`);
};
