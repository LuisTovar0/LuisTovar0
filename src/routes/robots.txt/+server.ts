import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
  const body = `User-agent: *\nAllow: /\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
