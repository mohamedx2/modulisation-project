const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.upsert({
      where: { email: 'newadmin@reno.com' },
      update: { 
        name: 'New Admin', 
        role: 'ADMIN',
        password: 'keycloak-managed'
      },
      create: {
        id: 'a93ec1af-ffb3-40e4-874d-4e4aad8884f4',
        email: 'newadmin@reno.com',
        name: 'New Admin',
        password: 'keycloak-managed',
        role: 'ADMIN',
      },
    });
    console.log('User created/updated in database:', user);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
