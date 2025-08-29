import { p as prisma } from "../../../../../chunks/prisma.js";
import bcrypt from "bcryptjs";
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
function normalizeUsername(name) {
  return String(name ?? "").trim().replace(/\s+/g, " ");
}
function assertValid(username, password) {
  if (!username || !password) return "Hiányzó adat";
  if (username.length < 3) return "A felhasználónév túl rövid (min. 3).";
  if (!/^\S(?:.*\S)?$/.test(username)) return "Érvénytelen felhasználónév.";
  if (password.length < 8) return "A jelszó túl rövid (min. 8).";
  return null;
}
async function POST({ request }) {
  try {
    const { username = "", password = "" } = await request.json();
    const uname = normalizeUsername(username);
    const err = assertValid(uname, password);
    if (err) return json({ success: false, error: err }, 400);
    const usernameLower = uname.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { usernameLower } });
    if (exists) return json({ success: false, error: "Felhasználó már létezik" }, 409);
    const passwordHash = bcrypt.hashSync(password, 12);
    await prisma.user.create({
      data: { username: uname, usernameLower, passwordHash, role: "user" }
    });
    return json({ success: true }, 201);
  } catch (e) {
    console.error("Register error:", e);
    return json({ success: false, error: "Váratlan hiba történt" }, 500);
  }
}
export {
  POST
};
