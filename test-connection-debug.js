require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL length:', dbUrl ? dbUrl.length : 0);
console.log('DATABASE_URL starts with:', dbUrl ? dbUrl.substring(0, 20) : 'N/A');

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: dbUrl,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Connection error:', err.message);
        console.error('Error code:', err.code);
        console.error('User tried:', err.user || 'not specified');
    } else {
        console.log('✅ Connected!');
        release();
    }
    pool.end();
});
