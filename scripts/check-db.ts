import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const progress = await prisma.mockRoundProgress.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
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
        console.log(`Round Name: ${p.round.title} (Number: ${p.round.roundNumber})`);
        console.log(`Status: ${p.status}`);
        console.log(`Score: ${p.score}`);
        console.log(`Created At: ${p.createdAt}`);
        console.log('------------------------------------');
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
