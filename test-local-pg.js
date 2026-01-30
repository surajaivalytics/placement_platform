const { Client } = require('pg');

async function testLocal() {
    console.log('Testing connection to localhost:5432...');
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'postgres', // common default
        port: 5432,
    });

    try {
        await client.connect();
        console.log('✅ LOCAL PG: Connected successfully');
        await client.end();
    } catch (err) {
        console.error('❌ LOCAL PG: Connection failed:', err.message);
    }
}

testLocal();
