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
  
  // Create sample vehicles for the tenant
  console.log('Seeding vehicles...');
  await prisma.vehicle.createMany({
    data: [
      {
        name: 'Renault Clio V',
        plate: 'TUN 9999',
        img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?q=80&w=600&auto=format&fit=crop',
        lastService: '12 OCT 2023',
        health: 75,
        tenantId: tenant.id,
      },
      {
        name: 'Renault Megane E-Tech',
        plate: 'TUN 8888',
        img: 'https://images.unsplash.com/photo-1621348160394-11180c7d4858?q=80&w=600&auto=format&fit=crop',
        lastService: '05 JAN 2024',
        health: 25,
        tenantId: tenant.id,
      },
    ],
  });

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
