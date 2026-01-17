const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkTables() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking database tables...\n');

        // List all tables
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;

        const result = await client.query(tablesQuery);

        console.log('📋 Tables in database:');
        result.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        // Check for Question table columns
        const questionCheck = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Question' 
            ORDER BY ordinal_position;
        `);

        if (questionCheck.rows.length > 0) {
            console.log('\n📊 Question table columns:');
            questionCheck.rows.forEach(row => {
                console.log(`  - ${row.column_name} (${row.data_type})`);
            });
        } else {
            console.log('\n⚠️  Question table not found!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

checkTables()
    .then(() => {
        console.log('\n✅ Check completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Check failed:', error);
        process.exit(1);
    });
