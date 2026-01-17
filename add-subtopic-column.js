const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function addSubtopicIdColumn() {
    const client = await pool.connect();
    try {
        console.log('🔄 Checking if subtopicId column exists...');

        // Check if column exists
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='Question' AND column_name='subtopicId';
        `;

        const result = await client.query(checkQuery);

        if (result.rows.length === 0) {
            console.log('➕ Adding subtopicId column to Question table...');

            // Add the column
            await client.query(`
                ALTER TABLE "Question" 
                ADD COLUMN "subtopicId" TEXT;
            `);

            // Add the index
            await client.query(`
                CREATE INDEX IF NOT EXISTS "Question_subtopicId_idx" 
                ON "Question"("subtopicId");
            `);

            // Add the foreign key constraint
            await client.query(`
                ALTER TABLE "Question" 
                ADD CONSTRAINT "Question_subtopicId_fkey" 
                FOREIGN KEY ("subtopicId") 
                REFERENCES "Subtopic"("id") 
                ON DELETE SET NULL 
                ON UPDATE CASCADE;
            `);

            console.log('✅ Successfully added subtopicId column and constraints!');
        } else {
            console.log('✅ subtopicId column already exists!');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

addSubtopicIdColumn()
    .then(() => {
        console.log('✅ Migration completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
