import { prisma } from './src/lib/prisma';

async function testPrismaConnection() {
    try {
        console.log('Testing Prisma client...');
        console.log('Prisma client has problem model:', 'problem' in prisma);
        console.log('Problem model methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(prisma.problem)));

        // Test if we can call findMany
        const problems = await prisma.problem.findMany({ take: 1 });
        console.log('✅ Successfully queried problems:', problems.length, 'found');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testPrismaConnection();
