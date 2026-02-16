import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: driveId } = await params;

        // Fetch enrollment
        const enrollment = await prisma.mockDriveEnrollment.findUnique({
            where: {
                userId_driveId: {
                    userId: session.user.id,
                    driveId: driveId,
                },
            },
            include: {
                drive: true,
                roundProgress: true
            }
        });

        if (!enrollment) {
            // If not enrolled, maybe we should auto-enroll or return 404?
            // For now, let's assume they must be enrolled.
            // Or we can return null progress which frontend interprets as "Starts"
            return NextResponse.json({ enrollment: null }, { status: 200 });
        }

        return NextResponse.json({ enrollment }, { status: 200 });
    } catch (error) {
        console.error('Error fetching mock drive progress:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
