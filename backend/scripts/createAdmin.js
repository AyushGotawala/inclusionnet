import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@inclusionnet.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@inclusionnet.com',
        phone: '+1234567890',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Admin user created successfully:', {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

createAdminUser();