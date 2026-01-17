import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Subtopic definitions for each topic
const subtopicDefinitions: Record<string, { name: string; description: string }[]> = {
    'Verbal Ability': [
        { name: 'Synonyms', description: 'Find words with similar meanings' },
        { name: 'Antonyms', description: 'Identify words with opposite meanings' },
        { name: 'Sentence Correction', description: 'Correct grammatical errors in sentences' },
        { name: 'Reading Comprehension', description: 'Understand and analyze passages' },
        { name: 'Spotting Errors', description: 'Identify grammatical mistakes' },
    ],
    'Logical Reasoning': [
        { name: 'Number Series', description: 'Complete numerical patterns' },
        { name: 'Coding-Decoding', description: 'Decode patterns and sequences' },
        { name: 'Blood Relations', description: 'Solve family relationship puzzles' },
        { name: 'Direction Sense', description: 'Navigate directional problems' },
        { name: 'Puzzles', description: 'Solve logical puzzles and arrangements' },
    ],
    'Basic Mathematics': [
        { name: 'Percentages', description: 'Calculate percentages and ratios' },
        { name: 'Profit & Loss', description: 'Solve profit and loss problems' },
        { name: 'Time & Work', description: 'Calculate work efficiency and time' },
        { name: 'Simple Interest', description: 'Calculate simple interest problems' },
        { name: 'Averages', description: 'Find averages and means' },
    ],
    'Aptitude': [
        { name: 'Arithmetic', description: 'Basic arithmetic operations' },
        { name: 'Data Interpretation', description: 'Analyze charts and graphs' },
        { name: 'Ratios', description: 'Solve ratio and proportion problems' },
        { name: 'Time & Distance', description: 'Calculate speed, time, and distance' },
        { name: 'Probability', description: 'Calculate probability and outcomes' },
    ],
};

async function createSubtopics() {
    console.log('🔍 Finding tests to add subtopics...');

    try {
        // Find all topic tests
        const tests = await prisma.test.findMany({
            where: {
                type: 'topic',
            },
        });

        console.log(`📚 Found ${tests.length} topic tests`);

        for (const test of tests) {
            console.log(`\n📖 Processing: ${test.title}`);

            // Check if test already has subtopics
            const existingSubtopics = await prisma.subtopic.findMany({
                where: { testId: test.id },
            });

            if (existingSubtopics.length > 0) {
                console.log(`  ⏭️  Skipping - already has ${existingSubtopics.length} subtopics`);
                continue;
            }

            // Find matching subtopic definitions
            let subtopicsToCreate: { name: string; description: string }[] = [];

            for (const [topicName, subtopics] of Object.entries(subtopicDefinitions)) {
                if (test.title.toLowerCase().includes(topicName.toLowerCase())) {
                    subtopicsToCreate = subtopics;
                    break;
                }
            }

            if (subtopicsToCreate.length === 0) {
                console.log(`  ⚠️  No subtopic definitions found for this test`);
                continue;
            }

            // Create subtopics
            for (let i = 0; i < subtopicsToCreate.length; i++) {
                const subtopic = subtopicsToCreate[i];
                await prisma.subtopic.create({
                    data: {
                        testId: test.id,
                        name: subtopic.name,
                        description: subtopic.description,
                        order: i + 1,
                        totalQuestions: 0, // Will be updated when questions are assigned
                    },
                });
                console.log(`  ✅ Created subtopic: ${subtopic.name}`);
            }
        }

        console.log('\n✨ Subtopics creation completed!');
    } catch (error) {
        console.error('❌ Error creating subtopics:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createSubtopics()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
