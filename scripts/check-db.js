const { PrismaClient } = require('@prisma/client');

// Use the DIRECT_URL from .env as it's usually more reliable for scripts
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.swexktlzarqksjdxzsiu:ahbWeZbvZcf7tJbL@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
        },
    },
});

async function main() {
    try {
        const progress = await prisma.mockRoundProgress.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                round: true,
                enrollment: {
                    include: {
                        user: true,
                        drive: true
                    }
                }
            }
        });

        console.log('--- Recent Round Progress Records ---');
        progress.forEach((p) => {
            console.log(`User: ${p.enrollment.user.email}`);
            console.log(`Drive: ${p.enrollment.drive.title}`);
            console.log(`Round: ${p.round.title} (Num: ${p.round.roundNumber})`);
            console.log(`Round Type: ${p.round.type}`);
            console.log(`Round Duration: ${p.round.durationMinutes} mins`);
            console.log(`Progress Status: ${p.status}`);
            console.log(`Progress ID: ${p.id}`);
            console.log(`Created: ${p.createdAt}`);
            console.log('---');
        });

        if (progress.length === 0) {
            console.log('No round progress records found.');
        }
    } catch (error) {
        console.error('Error querying database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
