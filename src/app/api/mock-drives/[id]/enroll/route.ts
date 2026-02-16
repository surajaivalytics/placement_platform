import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: driveId } = await params;

        // 1. Fetch Drive and Eligibility Criteria
        // Fetching without select for now to bypass strict static validation if the client is being fussy
        const drive = await prisma.mockCompanyDrive.findUnique({
            where: { id: driveId }
        });

        if (!drive) {
            return NextResponse.json({ error: 'Drive not found' }, { status: 404 });
        }

        // 2. Fetch User Profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 3. Check Eligibility
        // Use type assertion to access eligibilityCriteria dynamically if needed
        const criteria = (drive as any).eligibilityCriteria || {};
        const missingFields: string[] = [];

        // Check for missing data in profile
        if (criteria.minTenth && user.tenthPercentage === null) missingFields.push("10th Percentage");
        if (criteria.minTwelfth && user.twelfthPercentage === null) missingFields.push("12th Percentage");
        if (criteria.minGrad && user.graduationCGPA === null) missingFields.push("Graduation CGPA");

        if (missingFields.length > 0) {
            return NextResponse.json({
                error: 'Incomplete Profile',
                missingFields,
                eligible: false
            }, { status: 400 });
        }

        // Verify Criteria
        const isTenthOk = !criteria.minTenth || (user.tenthPercentage || 0) >= criteria.minTenth;
        const isTwelfthOk = !criteria.minTwelfth || (user.twelfthPercentage || 0) >= criteria.minTwelfth;
        const isGradOk = !criteria.minGrad || (user.graduationCGPA || 0) >= criteria.minGrad;
        const isBacklogsOk = !criteria.maxBacklogs && criteria.maxBacklogs !== 0 || (user.backlogs || 0) <= criteria.maxBacklogs;
        const isGapOk = !criteria.maxGap && criteria.maxGap !== 0 || (user.gapYears || 0) <= criteria.maxGap;

        if (!isTenthOk || !isTwelfthOk || !isGradOk || !isBacklogsOk || !isGapOk) {
            return NextResponse.json({
                error: 'Not eligible based on drive criteria',
                eligible: false
            }, { status: 403 });
        }

        // 4. Create Enrollment
        const enrollment = await prisma.mockDriveEnrollment.create({
            data: {
                userId: session.user.id,
                driveId: driveId,
                status: 'IN_PROGRESS',
                currentRoundNumber: 1,
            }
        });

        return NextResponse.json({
            success: true,
            enrollment,
            message: 'Successfully enrolled in the drive'
        });

    } catch (error: any) {
        console.error('Enrollment error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Already enrolled in this drive' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
