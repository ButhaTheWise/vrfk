// src/routes/health/+server.js
export const GET = () => new Response('ok', { status: 200 });
export const HEAD = GET;