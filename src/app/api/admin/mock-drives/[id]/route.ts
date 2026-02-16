import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const driveId = id;

        const drive = await prisma.mockCompanyDrive.findUnique({
            where: { id: driveId },
            include: {
                rounds: {
                    orderBy: { roundNumber: 'asc' },
                    include: {
                        questions: true
                    }
                }
            }
        });

        if (!drive) return NextResponse.json({ error: 'Drive not found' }, { status: 404 });

        return NextResponse.json({ drive });
    } catch (error) {
        console.error('Fetch admin drive details error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await prisma.mockCompanyDrive.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
