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
    update: { role: 'ADMIN', password: 'admin' },
    create: {
      id: 'admin',
      email: 'admin',
      name: 'Admin',
      password: 'admin',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });
  console.log('Admin user created:', admin.email);

  const user = await prisma.user.upsert({
    where: { email: 'user' },
    update: { role: 'USER', password: 'user' },
    create: {
      id: 'user',
      email: 'user',
      name: 'Simple User',
      password: 'user',
      role: 'USER',
      tenantId: tenant.id,
    },
  });
  console.log('Simple user created:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());