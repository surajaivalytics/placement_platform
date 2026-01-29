// Quick fix for database schema
require('dotenv').config();
const { Pool } = require('pg');

async function quickFix() {
    console.log('🚀 Quick fix starting...\n');

    // Use the pooled connection with pgbouncer
    const connectionString = process.env.DATABASE_URL;
    console.log('📡 Connecting to database...');
    console.log('Connection string:', connectionString ? 'Found' : 'NOT FOUND');

    const pool = new Pool({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        },
        // PgBouncer compatibility settings
        max: 1,
        idleTimeoutMillis: 0,
        connectionTimeoutMillis: 30000,
    });

    try {
        // Test connection
        const testResult = await pool.query('SELECT NOW() as now');
        console.log('✅ Connected! Current time:', testResult.rows[0].now);

        // Check if Subtopic table exists
        console.log('\n📋 Checking Subtopic table...');
        const tableCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'Subtopic'
        `);

        if (tableCheck.rows.length === 0) {
            console.log('❌ Subtopic table does not exist!');
            console.log('Creating Subtopic table...');

            await pool.query(`
                CREATE TABLE "Subtopic" (
                    "id" TEXT NOT NULL,
                    "testId" TEXT NOT NULL,
                    "name" TEXT NOT NULL,
                    "description" TEXT,
                    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
                    "order" INTEGER,
                    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "Subtopic_pkey" PRIMARY KEY ("id")
                )
            `);
            console.log('✅ Created Subtopic table');

        } else {
            console.log('✅ Subtopic table exists');

            // Check existing columns
            console.log('\n📋 Checking columns...');
            const columns = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'Subtopic'
                ORDER BY ordinal_position
            `);

            const columnNames = columns.rows.map(r => r.column_name);
            console.log('Existing columns:', columnNames.join(', '));

            // Add createdAt if missing
            if (!columnNames.includes('createdAt')) {
                console.log('\n➕ Adding createdAt column...');
                await pool.query(`
                    ALTER TABLE "Subtopic" 
                    ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                `);
                console.log('✅ Added createdAt column');
            } else {
                console.log('✅ createdAt column already exists');
            }

            // Add updatedAt if missing
            if (!columnNames.includes('updatedAt')) {
                console.log('\n➕ Adding updatedAt column...');
                await pool.query(`
                    ALTER TABLE "Subtopic" 
                    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                `);
                console.log('✅ Added updatedAt column');
            } else {
                console.log('✅ updatedAt column already exists');
            }
        }

        // Verify final state
        console.log('\n📋 Final verification...');
        const finalColumns = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Subtopic'
            ORDER BY ordinal_position
        `);

        console.log('\n✅ Subtopic table columns:');
        finalColumns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });

        console.log('\n🎉 Schema fix completed successfully!');
        console.log('You can now restart your dev server.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Full error:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

quickFix()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n💥 Failed:', error.message);
        process.exit(1);
    });
