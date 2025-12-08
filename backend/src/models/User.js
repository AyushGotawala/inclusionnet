import pkg from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { PrismaClient } = pkg;
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ 
    adapter,
    errorFormat: 'pretty',
    log: ['error', 'warn'],
});

export const createUser = async ({ name, email, phone, hashedPassword, role }) => {
    const user = await prisma.user.create({
        data: {
            name,
            email,
            phone: phone ?? null,
            password: hashedPassword,
            role,
        },
    });
    return user;
};

export const findByEmailOrNameOrPhone = async (name, email, phone) => {
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: { equals: email ?? "", mode: "insensitive" } },
                { name: { equals: name ?? "", mode: "insensitive" } },
                { phone: { equals: phone ?? "" } },
            ],
        },
    });
    return user;
};

export const findByEmail = async (email) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });
    return user;
};

export const findById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
    });
    return user;
};
