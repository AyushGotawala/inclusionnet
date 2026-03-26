import prisma from '../lib/prisma.js';

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
    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email?.toLowerCase().trim();
    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });
    return user;
};

export const findById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
    });
    return user;
};
