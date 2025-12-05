const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const client = new PrismaClient();

try {
  if (client.playlist) {
    fs.writeFileSync('verification_result.txt', 'Found');
  } else {
    fs.writeFileSync('verification_result.txt', 'Not Found');
  }
} catch (e) {
  fs.writeFileSync('verification_result.txt', 'Error: ' + e.message);
}
