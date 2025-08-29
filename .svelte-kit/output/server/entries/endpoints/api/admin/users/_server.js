import { p as prisma } from "../../../../../chunks/prisma.js";
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
async function GET({ locals }) {
  if (!locals.user || locals.user.role !== "admin") {
    return json({ success: false, error: "Nincs jogosultság" }, 403);
  }
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { id: "asc" }
  });
  return json({ success: true, users });
}
export {
  GET
};
