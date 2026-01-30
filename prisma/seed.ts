import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'admin',
            bio: 'System Administrator',
        },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            name: 'Test User',
            password: userPassword,
            role: 'user',
            bio: 'Regular user for testing',
        },
    });
    console.log('✅ Created test user:', user.email);

    // Create sample tests
    const mathTest = await prisma.test.create({
        data: {
            title: 'Basic Mathematics',
            description: 'Test your fundamental math skills',
            duration: 30,
            difficulty: 'Easy',
            questions: {
                create: [
                    {
                        text: 'What is 15 + 27?',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: '42', isCorrect: true },
                                { text: '41', isCorrect: false },
                                { text: '43', isCorrect: false },
                                { text: '40', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'What is 144 ÷ 12?',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: '10', isCorrect: false },
                                { text: '11', isCorrect: false },
                                { text: '12', isCorrect: true },
                                { text: '13', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'What is 8 × 7?',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: '54', isCorrect: false },
                                { text: '56', isCorrect: true },
                                { text: '58', isCorrect: false },
                                { text: '60', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'What is the square root of 81?',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: '7', isCorrect: false },
                                { text: '8', isCorrect: false },
                                { text: '9', isCorrect: true },
                                { text: '10', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'What is 25% of 200?',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: '40', isCorrect: false },
                                { text: '45', isCorrect: false },
                                { text: '50', isCorrect: true },
                                { text: '55', isCorrect: false },
                            ],
                        },
                    },
                ],
            },
        },
    });
    console.log('✅ Created test:', mathTest.title);

    const logicTest = await prisma.test.create({
        data: {
            title: 'Logical Reasoning',
            description: 'Test your logical thinking abilities',
            duration: 45,
            difficulty: 'Medium',
            questions: {
                create: [
                    {
                        text: 'If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: 'Yes', isCorrect: true },
                                { text: 'No', isCorrect: false },
                                { text: 'Cannot be determined', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'What comes next in the sequence: 2, 6, 12, 20, 30, ?',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: '38', isCorrect: false },
                                { text: '40', isCorrect: false },
                                { text: '42', isCorrect: true },
                                { text: '44', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: '5 minutes', isCorrect: true },
                                { text: '100 minutes', isCorrect: false },
                                { text: '20 minutes', isCorrect: false },
                                { text: '10 minutes', isCorrect: false },
                            ],
                        },
                    },
                ],
            },
        },
    });
    console.log('✅ Created test:', logicTest.title);

    const verbalTest = await prisma.test.create({
        data: {
            title: 'Verbal Ability',
            description: 'Test your vocabulary and comprehension',
            duration: 40,
            difficulty: 'Hard',
            questions: {
                create: [
                    {
                        text: 'Choose the word most similar in meaning to "EPHEMERAL":',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: 'Permanent', isCorrect: false },
                                { text: 'Temporary', isCorrect: true },
                                { text: 'Eternal', isCorrect: false },
                                { text: 'Solid', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'Choose the word opposite in meaning to "ABUNDANT":',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: 'Plentiful', isCorrect: false },
                                { text: 'Scarce', isCorrect: true },
                                { text: 'Ample', isCorrect: false },
                                { text: 'Copious', isCorrect: false },
                            ],
                        },
                    },
                    {
                        text: 'Complete the analogy: Book is to Reading as Fork is to:',
                        type: 'multiple-choice',
                        options: {
                            create: [
                                { text: 'Drawing', isCorrect: false },
                                { text: 'Writing', isCorrect: false },
                                { text: 'Eating', isCorrect: true },
                                { text: 'Stirring', isCorrect: false },
                            ],
                        },
                    },
                ],
            },
        },
    });
    console.log('✅ Created test:', verbalTest.title);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
