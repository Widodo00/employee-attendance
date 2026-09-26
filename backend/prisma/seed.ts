import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const employeePassword = await bcrypt.hash('Password123!', 10);

  await prisma.user.upsert({
    where: {
      email: 'admin@gmail.com',
    },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: {
      email: 'jhondoe@gmail.com',
    },
    update: {},
    create: {
      name: 'Jhon Doe',
      email: 'jhondoe@gmail.com',
      password: employeePassword,
      role: 'EMPLOYEE',
    },
  });

  console.log('🌱 Seed completed successfully');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
