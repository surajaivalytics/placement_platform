const { Client } = require('pg');
require('dotenv').config();

async function testRawPg() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Testing connection to:', connectionString.replace(/:[^:]+@/, ':****@'));

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ RAW PG: Connected successfully');
        const res = await client.query('SELECT NOW()');
        console.log('Time from DB:', res.rows[0]);
    } catch (err) {
        console.error('❌ RAW PG: Connection failed');
        console.error('Error message:', err.message);
        console.error('Error code:', err.code);
    } finally {
        await client.end();
    }
}

testRawPg();
