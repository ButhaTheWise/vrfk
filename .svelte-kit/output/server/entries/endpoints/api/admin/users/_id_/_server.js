import { p as prisma } from "../../../../../../chunks/prisma.js";
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
async function DELETE({ params, locals }) {
  if (!locals.user || locals.user.role !== "admin") return json({ success: false, error: "Nincs jogosultság" }, 403);
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) return json({ success: false, error: "Hibás felhasználó ID" }, 400);
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return json({ success: false, error: "Felhasználó nem található" }, 404);
  if (target.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) return json({ success: false, error: "Az utolsó admint nem lehet törölni" }, 409);
  }
  await prisma.user.delete({ where: { id } });
  return json({ success: true });
}
export {
  DELETE
};
