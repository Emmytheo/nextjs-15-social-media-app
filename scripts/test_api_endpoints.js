const { PrismaClient } = require('../node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  const u = await p.user.findFirst({
    where: { email: 'emmytheo7@gmail.com' },
    include: {
      sessions: { orderBy: { expiresAt: 'desc' }, take: 1 },
      organizationMemberships: { include: { organization: true } },
      organizationAdminRoles: { include: { organization: true } },
    }
  });

  const latestSession = u.sessions[0];
  console.log("Latest session ID:", latestSession.id);

  // Test /api/events with this session cookie
  try {
    const resAll = await fetch("http://127.0.0.1:3000/api/events", {
      headers: {
        Cookie: `auth_session=${latestSession.id}`,
      },
    });
    const eventsAll = await resAll.json();
    console.log("API /api/events (default):", eventsAll.length, "events");
    eventsAll.forEach(e => console.log(" - Event:", e.title, `(${e.organization?.name})`));

    const resMyGuilds = await fetch("http://127.0.0.1:3000/api/events?scope=my-guilds", {
      headers: {
        Cookie: `auth_session=${latestSession.id}`,
      },
    });
    const eventsMyGuilds = await resMyGuilds.json();
    console.log("API /api/events?scope=my-guilds:", eventsMyGuilds.length, "events");
    eventsMyGuilds.forEach(e => console.log(" - Event:", e.title, `(${e.organization?.name})`));

    const resOrgs = await fetch("http://127.0.0.1:3000/api/organizations", {
      headers: {
        Cookie: `auth_session=${latestSession.id}`,
      },
    });
    const orgs = await resOrgs.json();
    console.log("API /api/organizations:", orgs.length, "orgs");
    orgs.forEach(o => console.log(" - Org:", o.name));

  } catch (err) {
    console.error("Fetch error:", err.message);
  }
}

main().finally(() => p.$disconnect());
