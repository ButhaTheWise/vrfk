export const GET = () =>
  new Response('ok', {
    status: 200,
    headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' }
  });
export const HEAD = GET;
