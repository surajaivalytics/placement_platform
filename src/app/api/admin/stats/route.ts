import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Calculate average score across all results
        const results = await prisma.result.findMany({
            select: {
                score: true,
                total: true,
            },
        });

        let avgScore = 0;
        if (results.length > 0) {
            const totalPercentage = results.reduce((sum: number, result: any) => {
                return sum + (result.score / result.total) * 100;
            }, 0);
            avgScore = Math.round(totalPercentage / results.length);
        }

        return NextResponse.json({
            avgScore,
            totalResults: results.length,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
