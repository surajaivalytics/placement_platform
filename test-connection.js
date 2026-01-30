const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection with:', connectionString);

const pool = new Pool({
    connectionString: connectionString,
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
    } else {
        console.log('✅ Connection successful:', res.rows[0]);
    }
    pool.end();
});
