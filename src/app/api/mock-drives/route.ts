import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: List Drives (For Users/Admin)
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const [drives, stats] = await Promise.all([
            prisma.mockCompanyDrive.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    rounds: {
                        select: {
                            durationMinutes: true,
                            _count: {
                                select: { questions: true }
                            }
                        }
                    },
                    _count: {
                        select: { rounds: true }
                    }
                }
            }),
            prisma.$transaction([
                prisma.mockCompanyDrive.count(),
                prisma.mockQuestion.count(),
                prisma.mockRound.aggregate({
                    _avg: { durationMinutes: true }
                }),
                prisma.mockCompanyDrive.groupBy({
                    by: ['companyName'],
                    _count: { _all: true },
                    orderBy: {
                        companyName: 'asc'
                    }
                })
            ])
        ]);

        const processedDrives = drives.map(drive => {
            const totalQuestions = drive.rounds.reduce((acc, r) => acc + (r._count?.questions || 0), 0);
            const totalDuration = drive.rounds.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);
            return {
                ...drive,
                totalQuestions,
                totalDuration
            };
        });

        return NextResponse.json({
            drives: processedDrives,
            stats: {
                activeDrives: stats[0],
                totalQuestions: stats[1],
                avgDuration: Math.round(stats[2]._avg.durationMinutes || 0),
                uniqueCompanies: stats[3].length
            }
        });
    } catch (error) {
        console.error('Fetch drives error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create Drive (For Admin)
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Add admin check here in real code: if (session?.user?.role !== 'ADMIN') ...
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { title, companyName, description } = body;

        if (!title || !companyName) {
            return NextResponse.json({ error: 'Title and Company Name are required' }, { status: 400 });
        }

        const drive = await prisma.mockCompanyDrive.create({
            data: {
                title,
                companyName,
                description: description || '',
                isLive: true, // Default to live for now
            }
        });

        return NextResponse.json({ drive }, { status: 201 });
    } catch (error) {
        console.error('Create drive error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
