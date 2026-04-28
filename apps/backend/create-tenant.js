const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const t = await prisma.tenant.upsert({
    where: { id: 'default-tenant-id' },
    update: {},
    create: { id: 'default-tenant-id', name: 'Default Tenant' }
  });
  console.log(t);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
