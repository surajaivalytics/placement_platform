import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding Wipro Assessment...');

    // 1. Create the Wipro Test
    const wiproTest = await prisma.test.create({
        data: {
            title: 'Wipro National Talent Hunt 2026',
            description: 'Comprehensive assessment covering Aptitude, Logical Reasoning, Verbal Ability, and Coding.',
            duration: 120, // 2 hours
            difficulty: 'Hard',
            type: 'company',
            company: 'Wipro',
        }
    });

    console.log('✅ Created Test:', wiproTest.title);

    // 2. Create 2 Coding Questions (15 Marks each)
    const codingQuestions = [
        {
            text: "Reverse Words in a String",
            marks: 15,
            type: "coding",
            metadata: JSON.stringify({
                inputFormat: "A single line containing multiple words separated by spaces.",
                outputFormat: "Print the words in reverse order.",
                testCases: [
                    { input: "Hello World", output: "World Hello" },
                    { input: "The quick brown fox", output: "fox brown quick The" }
                ]
            })
        },
        {
            text: "Check for Balanced Parentheses",
            marks: 15,
            type: "coding",
            metadata: JSON.stringify({
                inputFormat: "A string containing '(', ')', '{', '}', '[' and ']'.",
                outputFormat: "Print 'true' if balanced, 'false' otherwise.",
                testCases: [
                    { input: "{[]}", output: "true" },
                    { input: "([)]", output: "false" }
                ]
            })
        }
    ];

    for (const q of codingQuestions) {
        await prisma.question.create({
            data: {
                testId: wiproTest.id,
                text: q.text,
                type: q.type,
                marks: q.marks,
                metadata: q.metadata
            }
        });
    }
    console.log('✅ Created 2 Coding Questions');

    // 3. Create 30 MCQs (1 Mark each)
    const mcqs = [];
    const categories = ['Aptitude', 'Logical', 'Verbal'];

    // Generating 10 questions for each category
    for (let i = 1; i <= 30; i++) {
        let category = categories[0];
        if (i > 10) category = categories[1];
        if (i > 20) category = categories[2];

        mcqs.push({
            text: `[${category}] Sample Question ${i}: Choose the correct option.`,
            marks: 1,
            type: "multiple-choice",
            options: {
                create: [
                    { text: "Option A", isCorrect: true },
                    { text: "Option B", isCorrect: false },
                    { text: "Option C", isCorrect: false },
                    { text: "Option D", isCorrect: false }
                ]
            }
        });
    }

    for (const q of mcqs) {
        await prisma.question.create({
            data: {
                testId: wiproTest.id,
                text: q.text,
                type: q.type,
                marks: q.marks,
                options: q.options
            }
        });
    }
    console.log('✅ Created 30 MCQs');

    console.log('🎉 Wipro Assessment Seeded Successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding Wipro test:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
