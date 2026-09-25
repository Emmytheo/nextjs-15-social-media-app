const { PrismaClient } = require('../node_modules/@prisma/client');
const { verify } = require('../node_modules/@node-rs/argon2');
const p = new PrismaClient();

async function main() {
  const u = await p.user.findFirst({ where: { email: 'emmytheo7@gmail.com' } });
  if (!u) {
    console.log("User not found!");
    return;
  }
  console.log("User found:", u.id, u.username, u.email);
  const match = await verify(u.passwordHash, 'EMMYfinest@123', {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  console.log("Password match:", match);

  // Check active sessions
  const sessions = await p.session.findMany({
    where: { userId: u.id },
  });
  console.log("Active sessions count:", sessions.length);
  sessions.forEach(s => console.log("Session:", s.id, "expiresAt:", s.expiresAt));
}

main().finally(() => p.$disconnect());
