import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  if (response.status === 404) {
    return new Response(null, { status: 301, headers: { location: '/' } });
  }
  return response;
};
