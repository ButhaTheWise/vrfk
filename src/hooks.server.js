import { getSession } from '$lib/server/session.js';

export const handle = async ({ event, resolve }) => {

  const sid = event.cookies.get('sid');
  if (sid) {
    const sess = await getSession(sid);
    if (sess) {
      event.locals.user = {
        id: sess.user.id,
        username: sess.user.username,
        role: sess.user.role,
        sid: sess.id
      };
    } else {
      event.cookies.delete('sid', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }
  }
  return resolve(event);
};