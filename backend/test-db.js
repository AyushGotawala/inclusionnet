import pkg from "@prisma/client";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// Test database connection
async function testConnection() {
    try {
        console.log('Testing database connection...');
        const result = await prisma.user.findMany();
        console.log('Database connection successful. Users found:', result.length);
        
        // Test creating a user
        console.log('Testing user creation...');
        const testUser = await prisma.user.create({
            data: {
                name: "Test User",
                email: `test${Date.now()}@example.com`,
                phone: "9876543210",
                password: "hashedpassword123",
                role: "BORROWER",
            },
        });
        console.log('Test user created successfully:', testUser.id);
        
        // Clean up test user
        await prisma.user.delete({
            where: { id: testUser.id }
        });
        console.log('Test user deleted successfully');
        
    } catch (error) {
        console.error('Database test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();