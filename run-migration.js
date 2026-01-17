require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('🔄 Running migration to create Subtopic tables...');

        // Create Subtopic table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Subtopic" (
                "id" TEXT NOT NULL,
                "testId" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "totalQuestions" INTEGER NOT NULL DEFAULT 0,
                "order" INTEGER,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('✅ Subtopic table created');

        // Create UserSubtopicProgress table
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "UserSubtopicProgress" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "subtopicId" TEXT NOT NULL,
                "score" INTEGER,
                "total" INTEGER,
                "percentage" DOUBLE PRECISION,
                "attempted" BOOLEAN NOT NULL DEFAULT false,
                "completed" BOOLEAN NOT NULL DEFAULT false,
                "answers" TEXT,
                "timeSpent" INTEGER,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "UserSubtopicProgress_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('✅ UserSubtopicProgress table created');

        // Add subtopicId column to Question table if it doesn't exist
        await prisma.$executeRawUnsafe(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='Question' AND column_name='subtopicId'
                ) THEN
                    ALTER TABLE "Question" ADD COLUMN "subtopicId" TEXT;
                END IF;
            END $$;
        `);
        console.log('✅ Added subtopicId column to Question table');

        // Create indexes
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "Subtopic_testId_idx" ON "Subtopic"("testId");
        `);
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "Question_subtopicId_idx" ON "Question"("subtopicId");
        `);
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UserSubtopicProgress_userId_subtopicId_key" 
            ON "UserSubtopicProgress"("userId", "subtopicId");
        `);
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "UserSubtopicProgress_userId_idx" ON "UserSubtopicProgress"("userId");
        `);
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS "UserSubtopicProgress_subtopicId_idx" ON "UserSubtopicProgress"("subtopicId");
        `);
        console.log('✅ Indexes created');

        // Add foreign keys
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'Subtopic_testId_fkey'
                ) THEN
                    ALTER TABLE "Subtopic" ADD CONSTRAINT "Subtopic_testId_fkey" 
                    FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'Question_subtopicId_fkey'
                ) THEN
                    ALTER TABLE "Question" ADD CONSTRAINT "Question_subtopicId_fkey" 
                    FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'UserSubtopicProgress_userId_fkey'
                ) THEN
                    ALTER TABLE "UserSubtopicProgress" ADD CONSTRAINT "UserSubtopicProgress_userId_fkey" 
                    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
        await prisma.$executeRawUnsafe(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'UserSubtopicProgress_subtopicId_fkey'
                ) THEN
                    ALTER TABLE "UserSubtopicProgress" ADD CONSTRAINT "UserSubtopicProgress_subtopicId_fkey" 
                    FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
        console.log('✅ Foreign keys added');

        console.log('🎉 Migration completed successfully!');

        await prisma.$disconnect();
        await pool.end();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await prisma.$disconnect();
        await pool.end();
        throw error;
    }
}

runMigration().catch(console.error);
