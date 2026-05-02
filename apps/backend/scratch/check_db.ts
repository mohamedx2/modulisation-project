import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const tenants = await prisma.tenant.findMany();
  console.log('Tenants:', JSON.stringify(tenants, null, 2));
  
  const users = await prisma.user.findMany({
    where: { email: 'admin_axis@reno.com' }
  });
  console.log('Admin User:', JSON.stringify(users, null, 2));

  const tickets = await prisma.ticket.findMany({ take: 5 });
  console.log('Sample Tickets:', JSON.stringify(tickets, null, 2));

  await prisma.$disconnect();
}

main();
