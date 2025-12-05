const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const client = new PrismaClient();

async function check() {
  try {
    // Try to count sessions, if table exists it works, else throws
    await client.session.count();
    fs.writeFileSync('db_verification.txt', 'Success');
  } catch (e) {
    fs.writeFileSync('db_verification.txt', 'Error: ' + e.message);
  } finally {
    await client.$disconnect();
  }
}

check();
