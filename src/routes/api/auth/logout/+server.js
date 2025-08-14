import { deleteSession } from '$lib/server/session.js';

const json = (d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json'}});

export async function POST({ cookies, locals }) {
  const sid = locals?.user?.sid || cookies.get('sid');
  if (sid) await deleteSession(sid);
  cookies.delete('sid', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  return json({ success:true });
}