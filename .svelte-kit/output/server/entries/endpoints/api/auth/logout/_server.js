import { d as deleteSession } from "../../../../../chunks/session.js";
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
async function POST({ cookies, locals }) {
  const sid = locals?.user?.sid || cookies.get("sid");
  if (sid) await deleteSession(sid);
  cookies.delete("sid", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
  return json({ success: true });
}
export {
  POST
};
