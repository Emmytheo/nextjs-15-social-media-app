const { PrismaClient } = require('../node_modules/@prisma/client');
const p = new PrismaClient();

async function testQuery(userId) {
  // 1. All events
  const allEvents = await p.event.findMany({
    where: { isPublished: true },
    include: { organization: true }
  });
  console.log("All published events:", allEvents.length);

  // 2. my-guilds events for userId
  const myGuildEvents = await p.event.findMany({
    where: {
      isPublished: true,
      organization: {
        OR: [
          { members: { some: { userId } } },
          { admins: { some: { userId } } },
        ]
      }
    },
    include: { organization: true }
  });
  console.log("My Guild events count for user:", myGuildEvents.length);
  myGuildEvents.forEach(e => console.log(" -", e.title, `(${e.organization.name})`));
}

async function main() {
  const u = await p.user.findFirst({ where: { email: 'emmytheo7@gmail.com' } });
  await testQuery(u.id);
}

main().finally(() => p.$disconnect());
