const { Client } = require('pg');

async function testExampleCreds() {
    const connectionString = "postgresql://postgres.urqnlwtlbzyuaqqbchlz:z3TONbdUhOu3NL9H@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    console.log('Testing connection to example database...');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ EXAMPLE CREDS: Connected successfully');
        const res = await client.query('SELECT NOW()');
        console.log('Time from DB:', res.rows[0]);
    } catch (err) {
        console.error('❌ EXAMPLE CREDS: Connection failed');
        console.error('Error message:', err.message);
    } finally {
        await client.end();
    }
}

testExampleCreds();
