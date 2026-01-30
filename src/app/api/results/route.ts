import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const resultId = searchParams.get('id');

        if (resultId) {
            // Get specific result
            const result = await prisma.result.findUnique({
                where: { id: resultId },
                include: {
                    test: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            if (!result) {
                return NextResponse.json(
                    { error: 'Result not found' },
                    { status: 404 }
                );
            }

            // Check if user owns this result or is admin
            if (result.userId !== session.user.id && session.user.role !== 'admin') {
                return NextResponse.json(
                    { error: 'Forbidden' },
                    { status: 403 }
                );
            }

            // Calculate percentage (not stored in DB)
            const percentage = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;

            return NextResponse.json({
                result: {
                    ...result,
                    percentage
                }
            });
        } else {
            // Get all results for the user
            const results = await prisma.result.findMany({
                where: {
                    userId: session.user.id,
                },
                include: {
                    test: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // Add percentage to each result
            const resultsWithPercentage = results.map(result => ({
                ...result,
                percentage: result.total > 0 ? Math.round((result.score / result.total) * 100) : 0
            }));

            return NextResponse.json({ results: resultsWithPercentage });
        }
    } catch (error) {
        console.error('Results fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { testTitle, testType, company, score, total, answers, solutions, essayText, duration } = body;

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Create or find test
        let test = await prisma.test.findFirst({
            where: {
                title: testTitle,
                type: testType,
                company: company,
            },
        });

        if (!test) {
            // Create a placeholder test for placement tests
            test = await prisma.test.create({
                data: {
                    title: testTitle,
                    description: `${company} placement test`,
                    duration: duration || 60,
                    difficulty: 'Medium',
                    type: testType,
                    company: company,
                    topic: company,
                },
            });
        }

        // Create result
        const result = await prisma.result.create({
            data: {
                userId: user.id,
                testId: test.id,
                score,
                total,
            },
        });

        return NextResponse.json({
            success: true,
            resultId: result.id,
            score,
            total,
            percentage: Math.round((score / total) * 100),
        });
    } catch (error) {
        console.error('Result submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
