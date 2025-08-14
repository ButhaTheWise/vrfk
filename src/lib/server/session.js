import { prisma } from './prisma.js';
import { randomBytes } from 'crypto';

const SESSION_DAYS = 30;

function expiresIn(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export async function createSession(userId) {
  const id = randomBytes(48).toString('base64url');
  const expiresAt = expiresIn(SESSION_DAYS);
  await prisma.session.create({
    data: { id, userId, expiresAt }
  });
  return { id, expiresAt };
}

export async function getSession(sessionId) {
  return prisma.session.findFirst({
    where: { id: sessionId, expiresAt: { gt: new Date() } },
    include: { user: true }
  });
}

export async function deleteSession(sessionId) {
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
}

export async function deleteUserSessions(userId) {
  await prisma.session.deleteMany({ where: { userId } });
}
