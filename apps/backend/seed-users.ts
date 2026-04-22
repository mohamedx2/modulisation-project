import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: 'default-tenant-id' },
    update: {},
    create: {
      id: 'default-tenant-id',
      name: 'Default Tenant',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin' },
    update: { role: 'ADMIN' },
    create: {
      id: 'admin',
      email: 'admin',
      name: 'Admin',
      password: 'admin',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user' },
    update: { role: 'USER' },
    create: {
      id: 'user',
      email: 'user',
      name: 'Simple User',
      password: 'user',
      role: 'USER',
      tenantId: tenant.id,
    },
  });
  console.log('Created Admin:', admin.email);
  console.log('Created User:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
