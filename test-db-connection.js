require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function testConnection() {
    try {
        console.log('🔄 Testing database connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
        console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Set' : 'Not set');

        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });

        // Test the connection
        const result = await prisma.$queryRaw`SELECT NOW()`;
        console.log('✅ Database connection successful!', result);

        // Check if Subtopic table exists
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'Subtopic'
        `;
        console.log('Subtopic table exists:', tables.length > 0 ? 'Yes' : 'No');

        await prisma.$disconnect();
        await pool.end();
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();
