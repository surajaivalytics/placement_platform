import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface QuestionWithOptions {
    id: string;
    text: string;
    type: string;
    category: string | null;
    difficulty: string | null;
    metadata: string | null;
    options: {
        id: string;
        text: string;
        isCorrect: boolean;
    }[];
}

/**
 * GET /api/placements/[id]/stage/[stageName]/questions
 * Fetches questions for a specific placement stage (TCS/Wipro)
 * This endpoint maps uploaded questions to the user-side placement flow
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; stageName: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, stageName } = await params;

        // Fetch the placement application
        const application = await prisma.placementApplication.findUnique({
            where: { id },
            include: {
                user: true,
                assessmentStages: {
                    where: { stageName },
                },
            },
        });

        if (!application) {
            return NextResponse.json(
                { error: 'Placement application not found' },
                { status: 404 }
            );
        }

        // Verify user owns this application or is admin
        if (application.user.email !== session.user.email && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if stage is already completed
        const existingStage = application.assessmentStages.find(
            (stage: any) => stage.stageName === stageName
        );

        if (existingStage?.submittedAt) {
            return NextResponse.json(
                { error: 'Stage already completed' },
                { status: 400 }
            );
        }

        // Find the appropriate test based on company and stage
        const test = await findTestForStage(application.company, stageName);

        if (!test) {
            return NextResponse.json(
                { error: `No test found for ${application.company} - ${stageName}` },
                { status: 404 }
            );
        }

        // Fetch questions for this test
        const questions = await prisma.question.findMany({
            where: { testId: test.id },
            include: {
                options: {
                    orderBy: { id: 'asc' },
                },
            },
            orderBy: { order: 'asc' }, // Sort by upload order to maintain sequence
        });

        if (!questions || questions.length === 0) {
            return NextResponse.json(
                { error: 'No questions found for this stage' },
                { status: 404 }
            );
        }

        // Configuration: Set to true to enable randomization (default: false to maintain upload order)
        const ENABLE_RANDOMIZATION = false;

        // Apply randomization only if enabled
        const orderedQuestions = ENABLE_RANDOMIZATION
            ? shuffleArray([...questions])
            : questions;

        // Select questions based on stage requirements
        const selectedQuestions = selectQuestionsForStage(
            application.company,
            stageName,
            orderedQuestions
        );

        // Remove correct answers from options for user view
        const sanitizedQuestions = selectedQuestions.map((q: any) => {
            let parsedMetadata = null;
            if (q.metadata) {
                try {
                    parsedMetadata = JSON.parse(q.metadata);
                } catch (e) {
                    console.error('Failed to parse metadata for question', q.id, e);
                }
            }

            return {
                id: q.id,
                text: q.text,
                type: q.type,
                category: q.category,
                difficulty: q.difficulty,
                metadata: parsedMetadata,
                options: q.options.map((opt: { id: string; text: string; isCorrect: boolean }) => ({
                    id: opt.id,
                    text: opt.text,
                    // Don't send isCorrect to client
                })),
            };
        });

        return NextResponse.json({
            test: {
                id: test.id,
                title: test.title,
                description: test.description,
                duration: test.duration,
                company: test.company,
            },
            questions: sanitizedQuestions,
            stageName,
            totalQuestions: sanitizedQuestions.length,
        });
    } catch (error) {
        console.error('Error fetching placement questions:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch questions',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

/**
 * Find the appropriate test for a company and stage
 */
async function findTestForStage(company: string, stageName: string) {
    // Map stage names to test titles or categories
    const testMapping: Record<string, { company: string; topic?: string }> = {
        // TCS stages
        foundation: { company: 'TCS', topic: 'Foundation' },
        advanced: { company: 'TCS', topic: 'Advanced' },
        coding: { company: 'TCS', topic: 'Coding' },

        // Wipro stages
        aptitude: { company: 'Wipro', topic: 'Aptitude' },
        essay: { company: 'Wipro', topic: 'Essay' },
    };

    const key = stageName.toLowerCase();
    const mapping = testMapping[key];

    if (!mapping) {
        return null;
    }

    // Find test that matches company and stage
    const test = await prisma.test.findFirst({
        where: {
            type: 'company',
            company: { equals: mapping.company, mode: 'insensitive' },
            OR: [
                { topic: { equals: mapping.topic, mode: 'insensitive' } },
                { title: { contains: mapping.topic, mode: 'insensitive' } },
            ],
        },
        orderBy: { createdAt: 'desc' }, // Get the most recent test
    });

    return test;
}

/**
 * Select appropriate number of questions based on stage requirements
 */
function selectQuestionsForStage(
    company: string,
    stageName: string,
    questions: QuestionWithOptions[]
): QuestionWithOptions[] {
    const stageConfig: Record<string, { count?: number; categories?: Record<string, number> }> = {
        // TCS Foundation: 30 questions (10 Numerical, 10 Verbal, 10 Reasoning)
        foundation: {
            categories: {
                numerical: 10,
                verbal: 10,
                reasoning: 10,
            },
        },
        // TCS Advanced: 20 questions (10 Quant, 10 Logical)
        advanced: {
            categories: {
                quant: 10,
                logical: 10,
            },
        },
        // TCS Coding: 3 problems
        coding: { count: 3 },

        // Wipro Aptitude: 30 questions (10 Quant, 10 Logical, 10 Verbal)
        aptitude: {
            categories: {
                quant: 10,
                logical: 10,
                verbal: 10,
            },
        },
        // Wipro Essay: 1 topic
        essay: { count: 1 },
    };

    const config = stageConfig[stageName.toLowerCase()];

    if (!config) {
        return questions.slice(0, 20); // Default to 20 questions
    }

    if (config.count) {
        return questions.slice(0, config.count);
    }

    if (config.categories) {
        const selected: QuestionWithOptions[] = [];
        for (const [category, count] of Object.entries(config.categories)) {
            const categoryQuestions = questions.filter(
                (q: any) => q.category?.toLowerCase() === category.toLowerCase()
            );
            selected.push(...categoryQuestions.slice(0, count));
        }

        // Fallback: If no questions matched categories, return top questions from the test
        if (selected.length === 0) {
            console.log(`No questions found for specific categories in ${stageName}, falling back to top questions`);
            return questions.slice(0, 30);
        }

        return selected;
    }

    return questions;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
