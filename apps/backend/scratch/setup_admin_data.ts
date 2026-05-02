import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  // 1. Assign admin to default tenant
  await prisma.user.update({
    where: { email: 'admin_axis@reno.com' },
    data: { tenantId: 'default-tenant-id' }
  });
  console.log('Admin user updated with default tenant.');

  // 2. Create sample tickets if empty
  const ticketCount = await prisma.ticket.count();
  if (ticketCount === 0) {
    await prisma.ticket.createMany({
      data: [
        {
          id: 'ticket-1',
          title: 'Révision Annuelle',
          description: 'Vérification complète du véhicule et vidange.',
          status: 'OPEN',
          createdBy: '3503ab89-b779-4a9c-ab4c-4e5573701519',
          tenantId: 'default-tenant-id',
          scheduledAt: new Date('2026-05-10T10:00:00Z')
        },
        {
          id: 'ticket-2',
          title: 'Changement de Pneus',
          description: 'Passage aux pneus été.',
          status: 'PENDING',
          createdBy: '3503ab89-b779-4a9c-ab4c-4e5573701519',
          tenantId: 'default-tenant-id',
          scheduledAt: new Date('2026-05-12T14:30:00Z')
        }
      ]
    });
    console.log('Sample tickets created.');
  }

  await prisma.$disconnect();
}

main();
