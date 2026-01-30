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
        const limit = parseInt(searchParams.get('limit') || '10');
        const testId = searchParams.get('testId');

        // Build where clause
        const where = testId ? { testId } : {};

        // Get top performers
        const topResults = await prisma.result.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                test: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        topic: true,
                    },
                },
            },
            orderBy: [
                { score: 'desc' },
                { createdAt: 'asc' }, // Earlier completion time as tiebreaker
            ],
            take: limit,
        });

        // Calculate rankings and percentages
        const leaderboard = topResults.map((result: any, index: number) => ({
            rank: index + 1,
            userId: result.user.id,
            userName: result.user.name || 'Anonymous',
            userEmail: result.user.email,
            userImage: result.user.image,
            testId: result.test.id,
            testTitle: result.test.title,
            testCompany: result.test.company,
            testTopic: result.test.topic,
            score: result.score,
            total: result.total,
            percentage: Math.round((result.score / result.total) * 100),
            completedAt: result.createdAt,
        }));

        // Get current user's rank if they have taken tests
        let userRank = null;
        if (session.user.id) {
            const userResults = await prisma.result.findMany({
                where: {
                    userId: session.user.id,
                    ...where,
                },
                orderBy: { score: 'desc' },
                take: 1,
            });

            if (userResults.length > 0) {
                const userBestScore = userResults[0].score;
                const betterScores = await prisma.result.count({
                    where: {
                        ...where,
                        OR: [
                            { score: { gt: userBestScore } },
                            {
                                score: userBestScore,
                                createdAt: { lt: userResults[0].createdAt },
                            },
                        ],
                    },
                });
                userRank = betterScores + 1;
            }
        }

        return NextResponse.json({
            leaderboard,
            userRank,
            totalEntries: leaderboard.length,
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
