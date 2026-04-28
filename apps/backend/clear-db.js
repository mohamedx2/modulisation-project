const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.auditLog.deleteMany();
  await prisma.ocrTask.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  console.log('Deleted all data');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
