const { PrismaClient } = require('../node_modules/@prisma/client');
const { PrismaAdapter } = require('../node_modules/@lucia-auth/adapter-prisma');
const { Lucia } = require('../node_modules/lucia');

const prisma = new PrismaClient();
const adapter = new PrismaAdapter(prisma.session, prisma.user);
const lucia = new Lucia(adapter, { sessionCookie: { expires: false, attributes: { secure: false } } });

async function main() {
  console.log("Query 1...");
  let t0 = Date.now();
  await lucia.validateSession("ipiimft7q3mmaeruc7pow6hcll5easvfl55aactc");
  console.log("Query 1:", Date.now() - t0, "ms");

  console.log("Query 2...");
  t0 = Date.now();
  const session2 = await lucia.validateSession("ipiimft7q3mmaeruc7pow6hcll5easvfl55aactc");
  console.log("Query 2:", Date.now() - t0, "ms");
  console.log("User:", session2.user?.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
