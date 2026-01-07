import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const company = searchParams.get('company');
        const status = searchParams.get('status');
        const track = searchParams.get('track');

        // Build filter
        const where: Prisma.PlacementApplicationWhereInput = {};
        if (company) where.company = company;
        if (status) where.status = status;
        if (track) where.finalTrack = track;

        // Fetch applications
        const applications = await prisma.placementApplication.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                eligibilityCheck: true,
                assessmentStages: {
                    orderBy: { createdAt: 'asc' },
                },
                voiceAssessment: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate statistics
        const stats = {
            total: applications.length,
            byCompany: {
                TCS: applications.filter(a => a.company === 'TCS').length,
                Wipro: applications.filter(a => a.company === 'Wipro').length,
            },
            byStatus: {
                eligibility_check: applications.filter(a => a.status === 'eligibility_check').length,
                in_progress: applications.filter(a =>
                    !['eligibility_check', 'completed', 'rejected'].includes(a.status)
                ).length,
                completed: applications.filter(a => a.status === 'completed').length,
                rejected: applications.filter(a => a.finalDecision === 'rejected').length,
            },
            byTrack: {
                Digital: applications.filter(a => a.finalTrack === 'Digital').length,
                Ninja: applications.filter(a => a.finalTrack === 'Ninja').length,
                Turbo: applications.filter(a => a.finalTrack === 'Turbo').length,
                Elite: applications.filter(a => a.finalTrack === 'Elite').length,
            },
        };

        return NextResponse.json({
            applications,
            stats,
        });
    } catch (error) {
        console.error('Error fetching placement applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}
