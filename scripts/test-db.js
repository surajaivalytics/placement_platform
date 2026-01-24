require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

console.log('Testing connection...');
console.log('DATABASE_URL:', databaseUrl ? 'Set' : 'Not Set');

async function testConnection(url, name) {
    if (!url) {
        console.log(`Skipping ${name}: URL not set`);
        return;
    }
    
    // Mask password for logging
    const maskedUrl = url.replace(/:([^@]+)@/, ':****@');
    console.log(`\nAttempting to connect to ${name} (${maskedUrl})...`);

    const pool = new Pool({
        connectionString: url,
        connectionTimeoutMillis: 5000,
    });

    try {
        const client = await pool.connect();
        console.log(`✅ Successfully connected to ${name}!`);
        const res = await client.query('SELECT NOW()');
        console.log(`   Query result (NOW): ${res.rows[0].now}`);
        client.release();
    } catch (err) {
        console.error(`❌ Failed to connect to ${name}:`);
        console.error(`   Code: ${err.code}`);
        console.error(`   Message: ${err.message}`);
        if (err.detail) console.error(`   Detail: ${err.detail}`);
    } finally {
        await pool.end();
    }
}

async function main() {
    await testConnection(databaseUrl, 'Pooler URL (DATABASE_URL)');
    if (directUrl && directUrl !== databaseUrl) {
        await testConnection(directUrl, 'Direct URL (DIRECT_URL)');
    } else {
        console.log('\nSkipping Direct URL test (same as DATABASE_URL or not set)');
    }
}

main().catch(console.error);
