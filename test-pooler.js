const { Client } = require('pg');
require('dotenv').config();

async function testPooler() {
    // Replace 5432 with 6543 and add pgbouncer=true
    const url = process.env.DATABASE_URL.replace(':5432/', ':6543/') + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true';
    console.log('Testing Pooler URL:', url.split('@')[1]);

    const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Pooler Success!');
        await client.end();
    } catch (err) {
        console.error('❌ Pooler Failed:', err.message);
    } finally {
        try { await client.end(); } catch (e) { }
    }
}

testPooler();
