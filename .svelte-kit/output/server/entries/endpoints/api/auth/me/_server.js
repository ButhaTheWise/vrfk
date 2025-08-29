const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
async function GET({ locals }) {
  if (!locals.user) return json({ authenticated: false });
  const { id, username, role } = locals.user;
  return json({ authenticated: true, user: { id, username, role } });
}
export {
  GET
};
