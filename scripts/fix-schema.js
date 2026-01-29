const { Pool } = require('pg');

async function fixSchema() {
    console.log('🔧 Fixing database schema...');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Test connection
        console.log('📡 Testing connection...');
        await pool.query('SELECT NOW()');
        console.log('✅ Connected to database');

        // Check if Subtopic table exists
        console.log('\n📋 Checking Subtopic table...');
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'Subtopic'
            );
        `);
        console.log('Subtopic table exists:', tableCheck.rows[0].exists);

        if (!tableCheck.rows[0].exists) {
            console.log('❌ Subtopic table does not exist. Running full migration...');

            // Create the full Subtopic table
            await pool.query(`
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
            console.log('✅ Created Subtopic table');

            // Add foreign key
            await pool.query(`
                ALTER TABLE "Subtopic" 
                ADD CONSTRAINT "Subtopic_testId_fkey" 
                FOREIGN KEY ("testId") REFERENCES "Test"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE;
            `);
            console.log('✅ Added foreign key constraint');

            // Create index
            await pool.query(`
                CREATE INDEX IF NOT EXISTS "Subtopic_testId_idx" ON "Subtopic"("testId");
            `);
            console.log('✅ Created index');

        } else {
            // Table exists, check for missing columns
            console.log('\n📋 Checking columns...');
            const columns = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'Subtopic'
                ORDER BY ordinal_position;
            `);

            const columnNames = columns.rows.map(r => r.column_name);
            console.log('Existing columns:', columnNames);

            // Add createdAt if missing
            if (!columnNames.includes('createdAt')) {
                console.log('➕ Adding createdAt column...');
                await pool.query(`
                    ALTER TABLE "Subtopic" 
                    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
                `);
                console.log('✅ Added createdAt');
            }

            // Add updatedAt if missing
            if (!columnNames.includes('updatedAt')) {
                console.log('➕ Adding updatedAt column...');
                await pool.query(`
                    ALTER TABLE "Subtopic" 
                    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
                `);
                console.log('✅ Added updatedAt');
            }
        }

        // Add subtopicId to Question table if missing
        console.log('\n📋 Checking Question table...');
        const questionColumns = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Question';
        `);
        const questionColumnNames = questionColumns.rows.map(r => r.column_name);

        if (!questionColumnNames.includes('subtopicId')) {
            console.log('➕ Adding subtopicId to Question table...');
            await pool.query(`
                ALTER TABLE "Question" ADD COLUMN "subtopicId" TEXT;
            `);

            // Add foreign key
            await pool.query(`
                ALTER TABLE "Question" 
                ADD CONSTRAINT "Question_subtopicId_fkey" 
                FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE;
            `);

            // Add index
            await pool.query(`
                CREATE INDEX IF NOT EXISTS "Question_subtopicId_idx" ON "Question"("subtopicId");
            `);
            console.log('✅ Added subtopicId to Question table');
        }

        // Create UserSubtopicProgress table if missing
        console.log('\n📋 Checking UserSubtopicProgress table...');
        const progressTableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'UserSubtopicProgress'
            );
        `);

        if (!progressTableCheck.rows[0].exists) {
            console.log('➕ Creating UserSubtopicProgress table...');
            await pool.query(`
                CREATE TABLE "UserSubtopicProgress" (
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

            // Add constraints and indexes
            await pool.query(`
                CREATE UNIQUE INDEX "UserSubtopicProgress_userId_subtopicId_key" 
                ON "UserSubtopicProgress"("userId", "subtopicId");
            `);
            await pool.query(`
                CREATE INDEX "UserSubtopicProgress_userId_idx" ON "UserSubtopicProgress"("userId");
            `);
            await pool.query(`
                CREATE INDEX "UserSubtopicProgress_subtopicId_idx" ON "UserSubtopicProgress"("subtopicId");
            `);

            // Add foreign keys
            await pool.query(`
                ALTER TABLE "UserSubtopicProgress" 
                ADD CONSTRAINT "UserSubtopicProgress_userId_fkey" 
                FOREIGN KEY ("userId") REFERENCES "User"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE;
            `);
            await pool.query(`
                ALTER TABLE "UserSubtopicProgress" 
                ADD CONSTRAINT "UserSubtopicProgress_subtopicId_fkey" 
                FOREIGN KEY ("subtopicId") REFERENCES "Subtopic"("id") 
                ON DELETE CASCADE ON UPDATE CASCADE;
            `);
            console.log('✅ Created UserSubtopicProgress table');
        }

        console.log('\n✅ Schema fix completed successfully!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    } finally {
        await pool.end();
    }
}

fixSchema()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Failed:', error.message);
        process.exit(1);
    });
