const { Client } = require('pg');
require('dotenv').config();

async function testBoth() {
    const urls = [
        process.env.DATABASE_URL,
        process.env.DIRECT_URL
    ];

    for (const url of urls) {
        console.log('Testing:', url.split('@')[1]);
        const client = new Client({
            connectionString: url,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            console.log('✅ Success!');
            await client.end();
            return;
        } catch (err) {
            console.error('❌ Failed:', err.message);
        } finally {
            try { await client.end(); } catch (e) { }
        }
    }
}

testBoth();
