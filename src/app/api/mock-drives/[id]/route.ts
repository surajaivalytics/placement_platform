import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const drive = await prisma.mockCompanyDrive.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { rounds: true }
                }
            }
        });

        if (!drive) {
            return NextResponse.json({ error: 'Drive not found' }, { status: 404 });
        }

        return NextResponse.json({ drive });
    } catch (error) {
        console.error('Error fetching mock drive:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
