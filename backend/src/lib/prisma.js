import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

// Create a singleton instance of Prisma Client with adapter
const globalForPrisma = global;

// Prefer DIRECT_URL to avoid pgBouncer connection edge cases
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL is missing. Check backend/.env');
}
const isSupabase = typeof connectionString === 'string' && connectionString.includes('supabase.com');

// Initialize PostgreSQL pool
const pool = new Pool({ 
  connectionString,
  // Supabase pooler is best-effort; too many concurrent connections can be refused.
  max: 10,
  idleTimeoutMillis: 30000,
  // Supabase is remote; 2s is often too tight
  connectionTimeoutMillis: 30000,
  // Supabase typically requires SSL
  ...(isSupabase ? { ssl: { rejectUnauthorized: false } } : {}),
});

// Create adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter
const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});

export default prisma;