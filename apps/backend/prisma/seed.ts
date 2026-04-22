import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'default-tenant-id' },
    update: {},
    create: {
      id: 'default-tenant-id',
      name: 'Renault Global',
    },
  });

  console.log(`Created Tenant: ${tenant.name}`);

  // Create super admin
  const hashedPassword = await bcrypt.hash('admin', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@renault.com' },
    update: {},
    create: {
      email: 'admin@renault.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: Role.ADMIN,
      tenantId: tenant.id,
    },
  });

  console.log(`Created Admin User: ${admin.email}`);

  // Create a sample mechanic
  const mechanicPass = await bcrypt.hash('mechanic', 10);
  const mechanic = await prisma.user.upsert({
    where: { email: 'mechanic@renault.com' },
    update: {},
    create: {
      email: 'mechanic@renault.com',
      name: 'John Mechanic',
      password: mechanicPass,
      role: Role.MECHANIC,
      tenantId: tenant.id,
    },
  });

  console.log(`Created Mechanic User: ${mechanic.email}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
