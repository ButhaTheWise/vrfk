// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const isProd = process.env.NODE_ENV === 'production';
  const ADMIN_USER = (process.env.ADMIN_USER || 'Butha').trim();
  let adminPass = process.env.ADMIN_PASS;

  if (!isProd && !adminPass) {
    adminPass = randomBytes(18).toString('base64url'); // dev: random
  }

  if (!adminPass && isProd) {
    throw new Error('Missing ADMIN_PASS in production for initial admin seed.');
  }

  const usernameLower = ADMIN_USER.toLowerCase();
  const passwordHash = adminPass ? bcrypt.hashSync(adminPass, 12) : undefined;

  // upsert – ha nincs, létrehozza; ha van, békén hagyja
  await prisma.user.upsert({
    where: { usernameLower },
    update: {}, // nem írjuk felül létező admin adatait
    create: {
      username: ADMIN_USER,
      usernameLower,
      passwordHash: passwordHash ?? bcrypt.hashSync(randomBytes(18).toString('base64url'), 12),
      role: 'admin' // vagy Role.admin, ha enum
    }
  });

  if (!isProd) {
    // csak fejlesztéskor logoljuk az esetleges random jelszót
    console.log(`✅ Admin user: ${ADMIN_USER}`);
    if (process.env.ADMIN_PASS) {
      console.log(`🔐 ADMIN_PASS (ENV): ${process.env.ADMIN_PASS}`);
    } else {
      console.log(`🔐 Generated admin password: ${adminPass}`);
    }
  } else {
    console.warn(`🔐 Admin létrehozva/ellenőrizve: ${ADMIN_USER}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());