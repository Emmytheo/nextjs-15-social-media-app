const { PrismaClient } = require('../node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  const events = await p.event.findMany({
    include: {
      organization: { select: { id: true, name: true } },
      attendees: true,
    }
  });
  console.log("Total events in DB:", events.length);
  events.forEach(e => {
    console.log({
      id: e.id,
      title: e.title,
      isPublished: e.isPublished,
      status: e.status,
      orgId: e.organizationId,
      orgName: e.organization?.name,
      startDate: e.startDate,
      category: e.category,
    });
  });
}

main().finally(() => p.$disconnect());
