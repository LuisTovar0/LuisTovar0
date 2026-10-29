import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => ({
  hideStuff: env.HIDE_STUFF === 'true',
});
