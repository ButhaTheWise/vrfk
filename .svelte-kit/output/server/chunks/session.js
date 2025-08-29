import { p as prisma } from "./prisma.js";
import { randomBytes } from "crypto";
const SESSION_DAYS = 30;
function expiresIn(days) {
  const d = /* @__PURE__ */ new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}
async function createSession(userId) {
  const id = randomBytes(48).toString("base64url");
  const expiresAt = expiresIn(SESSION_DAYS);
  await prisma.session.create({
    data: { id, userId, expiresAt }
  });
  return { id, expiresAt };
}
async function getSession(sessionId) {
  return prisma.session.findFirst({
    where: { id: sessionId, expiresAt: { gt: /* @__PURE__ */ new Date() } },
    include: { user: true }
  });
}
async function deleteSession(sessionId) {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
  });
}
export {
  createSession as c,
  deleteSession as d,
  getSession as g
};
