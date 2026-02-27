const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres.swexktlzarqksjdxzsiu:ahbWeZbvZcf7tJbL@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
});

async function main() {
    try {
        await client.connect();

        const query = `
      SELECT 
        u.email,
        d.title as drive_title,
        r.title as round_title,
        r."roundNumber",
        r.type as round_type,
        r."durationMinutes",
        rp.status as progress_status,
        rp.score,
        rp."startedAt"
      FROM "MockRoundProgress" rp
      JOIN "MockRound" r ON rp."roundId" = r.id
      JOIN "MockDriveEnrollment" e ON rp."enrollmentId" = e.id
      JOIN "MockCompanyDrive" d ON e."driveId" = d.id
      JOIN "User" u ON e."userId" = u.id
      ORDER BY rp."startedAt" DESC NULLS LAST
      LIMIT 10;
    `;

        const res = await client.query(query);

        console.log('--- Recent Round Progress Records (Direct DB Query) ---');
        res.rows.forEach((row) => {
            console.log(`User: ${row.email}`);
            console.log(`Drive: ${row.drive_title}`);
            console.log(`Round: ${row.round_title} (Num: ${row.roundNumber})`);
            console.log(`Round Type: ${row.round_type}`);
            console.log(`Round Duration: ${row.durationMinutes} mins`);
            console.log(`Status: ${row.progress_status}`);
            console.log(`Score: ${row.score}`);
            console.log(`Created: ${row.createdAt}`);
            console.log('---');
        });

        if (res.rows.length === 0) {
            console.log('No round progress records found.');
        }
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
}

main();
