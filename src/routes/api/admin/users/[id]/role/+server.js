// src/routes/api/admin/users/[id]/role/+server.js
import { prisma } from '$lib/server/prisma.js';

const json = (d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'Content-Type':'application/json'}});
export async function POST({ params, request, locals }) {
  if (!locals.user || locals.user.role !== 'admin') return json({ success:false, error:'Nincs jogosultság' }, 403);

  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) return json({ success:false, error:'Hibás felhasználó ID' }, 400);

  const { role } = await request.json();
  if (!['user','admin'].includes(role)) return json({ success:false, error:'Érvénytelen szerep' }, 400);

  // utolsó admin védelem
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return json({ success:false, error:'Felhasználó nem található' }, 404);
  if (target.role === 'admin' && role === 'user') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount <= 1) return json({ success:false, error:'Az utolsó admint nem lehet lefokozni' }, 409);
  }

  await prisma.user.update({ where: { id }, data: { role } });
  return json({ success:true });
}