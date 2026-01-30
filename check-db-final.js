const { Pool } = require('pg');
require('dotenv').config();

async function checkUsers() {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    const pool = new Pool({
        connectionString: connectionString,
    });

    try {
        console.log('Checking User table structure...');
        const structure = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `);
        console.log('Columns:', structure.rows);

        console.log('Checking actual users...');
        const users = await pool.query('SELECT id, email, name, role FROM "User"');
        console.log('Users found:', users.rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkUsers();
