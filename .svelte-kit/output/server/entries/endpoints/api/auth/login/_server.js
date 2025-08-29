import { p as prisma } from "../../../../../chunks/prisma.js";
import { c as createSession } from "../../../../../chunks/session.js";
import bcrypt from "bcryptjs";
const attempts = /* @__PURE__ */ new Map();
const LIMIT = 100;
const WINDOW = 10 * 60 * 1e3;
function rateLimit(ip) {
  const now = Date.now();
  const rec = attempts.get(ip) || { c: 0, t: now };
  if (now - rec.t > WINDOW) {
    rec.c = 0;
    rec.t = now;
  }
  rec.c++;
  attempts.set(ip, rec);
  return rec.c <= LIMIT;
}
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
async function POST({ request, cookies, getClientAddress }) {
  const ip = getClientAddress?.() || "unknown";
  if (!rateLimit(ip)) return json({ success: false, error: "Túl sok próbálkozás. Próbáld később." }, 429);
  try {
    const { username = "", password = "" } = await request.json();
    const invalid = "Hibás felhasználónév vagy jelszó";
    const user = await prisma.user.findUnique({ where: { usernameLower: String(username).trim().toLowerCase() } });
    if (!user) return json({ success: false, error: invalid }, 401);
    const ok = bcrypt.compareSync(String(password), user.passwordHash);
    if (!ok) return json({ success: false, error: invalid }, 401);
    const sess = await createSession(user.id);
    cookies.set("sid", sess.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30
    });
    return json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    console.error("Login error:", e);
    return json({ success: false, error: "Váratlan hiba történt" }, 500);
  }
}
export {
  POST
};
