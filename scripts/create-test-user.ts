import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create the adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the adapter
const prisma = new PrismaClient({
    adapter,
});

async function createTestUsers() {
    try {
        console.log('🔄 Creating test users...\n');

        // Hash passwords
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create admin user
        const admin = await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {},
            create: {
                email: 'admin@test.com',
                name: 'Admin User',
                password: hashedPassword,
                role: 'admin',
            },
        });

        console.log('✅ Admin user created:');
        console.log('   Email: admin@test.com');
        console.log('   Password: password123');
        console.log('   Role: admin\n');

        // Create regular user
        const user = await prisma.user.upsert({
            where: { email: 'user@test.com' },
            update: {},
            create: {
                email: 'user@test.com',
                name: 'Test User',
                password: hashedPassword,
                role: 'user',
            },
        });

        console.log('✅ Regular user created:');
        console.log('   Email: user@test.com');
        console.log('   Password: password123');
        console.log('   Role: user\n');

        console.log('🎉 Test users created successfully!\n');
        console.log('You can now log in with either:');
        console.log('  - admin@test.com / password123 (Admin)');
        console.log('  - user@test.com / password123 (User)\n');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

createTestUsers()
    .then(() => {
        console.log('✅ Script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
