const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres.swexktlzarqksjdxzsiu:ahbWeZbvZcf7tJbL@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
});

async function main() {
    try {
        await client.connect();
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', res.rows.map(r => r.table_name));

        for (const table of res.rows.map(r => r.table_name)) {
            if (table.toLowerCase().includes('round')) {
                const columns = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
                console.log(`Columns for ${table}:`, columns.rows.map(c => c.column_name));
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

main();
