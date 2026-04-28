import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  // Delete all users (this will cascade delete all transactions, plans, deposits, etc.)
  await prisma.user.deleteMany();

  console.log('Seeding new users...');

  // 1. Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@easyearning.com',
      password: adminPassword,
      role: 'ADMIN',
      refCode: 'EE-ADMIN',
    },
  });
  console.log('Admin created:', admin.email);

  // 2. Create Test User
  const userPassword = await bcrypt.hash('user123', 12);
  const testUser = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@easyearning.com',
      password: userPassword,
      role: 'USER',
      refCode: 'EE-TEST1',
    },
  });
  console.log('Test User created:', testUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
