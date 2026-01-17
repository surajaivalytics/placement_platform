const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createSubtopicTables() {
    const client = await pool.connect();
    try {
        console.log('🔄 Creating Subtopic and UserSubtopicProgress tables...\n');

        // Create Subtopic table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Subtopic" (
                "id" TEXT NOT NULL,
                "testId" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT,
                "totalQuestions" INTEGER NOT NULL DEFAULT 0,
                "order" INTEGER,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('✅ Subtopic table created');

        // Create UserSubtopicProgress table
        await client.query(`
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
                "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "UserSubtopicProgress_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('✅ UserSubtopicProgress table created');

        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS "Subtopic_testId_idx" ON "Subtopic"("testId");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "Question_subtopicId_idx" ON "Question"("subtopicId");`);
        await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "UserSubtopicProgress_userId_subtopicId_key" ON "UserSubtopicProgress"("userId", "subtopicId");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "UserSubtopicProgress_userId_idx" ON "UserSubtopicProgress"("userId");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "UserSubtopicProgress_subtopicId_idx" ON "UserSubtopicProgress"("subtopicId");`);
        console.log('✅ Indexes created');

        // Add foreign keys
        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'Subtopic_testId_fkey'
                ) THEN
                    ALTER TABLE "Subtopic" 
                    ADD CONSTRAINT "Subtopic_testId_fkey" 
                    FOREIGN KEY ("testId") REFERENCES "Test"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'Question_subtopicId_fkey'
                ) THEN
                    ALTER TABLE "Question" 
                    ADD CONSTRAINT "Question_subtopicId_fkey" 
                    FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") 
                    ON DELETE SET NULL ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'UserSubtopicProgress_userId_fkey'
                ) THEN
                    ALTER TABLE "UserSubtopicProgress" 
                    ADD CONSTRAINT "UserSubtopicProgress_userId_fkey" 
                    FOREIGN KEY ("userId") REFERENCES "User"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);

        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'UserSubtopicProgress_subtopicId_fkey'
                ) THEN
                    ALTER TABLE "UserSubtopicProgress" 
                    ADD CONSTRAINT "UserSubtopicProgress_subtopicId_fkey" 
                    FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                END IF;
            END $$;
        `);
        console.log('✅ Foreign keys created');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createSubtopicTables()
    .then(() => {
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    });
