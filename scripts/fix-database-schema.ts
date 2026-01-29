import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function fixDatabaseSchema() {
    console.log('🔧 Starting database schema fix...');

    const pool = new Pool({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        // Check if Subtopic table exists
        console.log('📋 Checking Subtopic table...');
        const subtopicTableCheck = await prisma.$queryRaw`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'Subtopic'
            );
        `;
        console.log('Subtopic table exists:', subtopicTableCheck);

        // Check columns in Subtopic table
        console.log('📋 Checking Subtopic columns...');
        const subtopicColumns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Subtopic';
        `;
        console.log('Subtopic columns:', subtopicColumns);

        // Add missing columns if needed
        console.log('🔧 Adding missing columns...');

        // Add createdAt if missing
        await prisma.$executeRaw`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='Subtopic' AND column_name='createdAt'
                ) THEN
                    ALTER TABLE "Subtopic" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
                END IF;
            END $$;
        `;

        // Add updatedAt if missing
        await prisma.$executeRaw`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='Subtopic' AND column_name='updatedAt'
                ) THEN
                    ALTER TABLE "Subtopic" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
                END IF;
            END $$;
        `;

        console.log('✅ Schema fix completed!');

        // Verify the fix
        const verifyColumns = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Subtopic'
            ORDER BY ordinal_position;
        `;
        console.log('📋 Final Subtopic columns:', verifyColumns);

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

fixDatabaseSchema()
    .then(() => {
        console.log('✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Failed:', error);
        process.exit(1);
    });
