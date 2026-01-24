import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const {
            audioData,
            duration,
            fluencyScore,
            pronunciationScore,
            paceScore,
            clarityScore,
            totalScore,
            isPassed,
        } = body;


        // Fetch application
        const application = await prisma.placementApplication.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Verify application belongs to user or user is admin
        if (application.user.email !== session.user.email && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if voice assessment already exists
        const existingAssessment = await prisma.voiceAssessment.findUnique({
            where: { applicationId: id },
        });

        if (existingAssessment?.assessedAt) {
            return NextResponse.json(
                { error: 'Voice assessment already completed' },
                { status: 400 }
            );
        }

        // Create or update voice assessment
        const voiceAssessment = await prisma.voiceAssessment.upsert({
            where: { applicationId: id },
            create: {
                applicationId: id,
                audioUrl: audioData, // In production, upload to cloud storage and store URL
                fluencyScore,
                pronunciationScore,
                paceScore,
                clarityScore,
                totalScore, // Updated field name
                isPassed,
                assessedAt: new Date(),
                feedback: generateVoiceFeedback(fluencyScore, pronunciationScore, paceScore, clarityScore),
            },
            update: {
                audioUrl: audioData,
                fluencyScore,
                pronunciationScore,
                paceScore,
                clarityScore,
                totalScore, // Updated field name
                isPassed,
                assessedAt: new Date(),
                feedback: generateVoiceFeedback(fluencyScore, pronunciationScore, paceScore, clarityScore),
            },
        });

        // Update application status
        const nextStage = isPassed ? 'interview' : 'rejected';
        await prisma.placementApplication.update({
            where: { id },
            data: {
                status: nextStage,
                currentStage: 'voice',
                finalDecision: isPassed ? undefined : 'rejected',
            },
        });

        return NextResponse.json({
            success: true,
            isPassed,
            nextStage: isPassed ? 'interview' : null,
            scores: {
                fluency: fluencyScore,
                pronunciation: pronunciationScore,
                pace: paceScore,
                clarity: clarityScore,
                overall: totalScore, // Mapping back to response format if expected by client
            },
        });
    } catch (error) {
        console.error('Error submitting voice assessment:', error);
        return NextResponse.json(
            { error: 'Failed to submit voice assessment' },
            { status: 500 }
        );
    }
}

function generateVoiceFeedback(
    fluency: number,
    pronunciation: number,
    pace: number,
    clarity: number
): string {
    const feedback: string[] = [];

    if (fluency >= 80) {
        feedback.push('Excellent fluency! You spoke smoothly and confidently.');
    } else if (fluency >= 60) {
        feedback.push('Good fluency. Consider practicing to reduce hesitations.');
    } else {
        feedback.push('Work on improving fluency by practicing speaking regularly.');
    }

    if (pronunciation >= 80) {
        feedback.push('Great pronunciation! Your words were clear and well-articulated.');
    } else if (pronunciation >= 60) {
        feedback.push('Decent pronunciation. Focus on enunciating difficult words.');
    } else {
        feedback.push('Improve pronunciation by listening to native speakers and practicing.');
    }

    if (pace >= 80) {
        feedback.push('Perfect speaking pace! Not too fast, not too slow.');
    } else if (pace >= 60) {
        feedback.push('Good pace. Try to maintain consistency throughout.');
    } else {
        feedback.push('Adjust your speaking pace for better comprehension.');
    }

    if (clarity >= 80) {
        feedback.push('Excellent clarity! Your message was easy to understand.');
    } else if (clarity >= 60) {
        feedback.push('Good clarity. Organize your thoughts before speaking.');
    } else {
        feedback.push('Improve clarity by structuring your responses better.');
    }

    return feedback.join(' ');
}
