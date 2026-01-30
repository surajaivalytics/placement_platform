import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; stageName: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, stageName } = await params;
        const body = await request.json();
        const { answers, score, total, timeSpent, essayText, code, language } = body;


        // Fetch application
        const application = await prisma.placementApplication.findUnique({
            where: { id },
            include: {
                assessmentStages: true,
                user: true,
            },
        });

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Verify application belongs to user or user is admin
        if (application.user.email !== session.user.email && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Check if stage already completed
        const existingStage = application.assessmentStages.find(
            (stage: any) => stage.stageName === stageName
        );

        if (existingStage && existingStage.submittedAt) {
            return NextResponse.json(
                { error: 'Stage already completed' },
                { status: 400 }
            );
        }

        // Calculate score on backend for security
        let calculatedScore = score;
        let calculatedTotal = total;

        // Map stage to test topic for MCQ stages
        const stageTopicMap: Record<string, string> = {
            'foundation': 'Foundation',
            'advanced': 'Advanced',
            'aptitude': 'Aptitude',
        };

        const topic = stageTopicMap[stageName];
        if (topic) {
            // Fetch test and questions to calculate score
            const test = await prisma.test.findFirst({
                where: {
                    type: 'company',
                    company: application.company,
                    topic: topic,
                },
                include: {
                    questions: {
                        include: {
                            options: true,
                        },
                    },
                },
            });

            if (test) {
                calculatedTotal = test.questions.length;
                calculatedScore = 0;

                test.questions.forEach((q: any) => {
                    const userAnswerText = (answers as any)[q.id];
                    const correctOption = q.options.find((o: any) => o.isCorrect);

                    if (userAnswerText && correctOption && userAnswerText === correctOption.text) {
                        calculatedScore++;
                    }
                });
            }
        }

        // Calculate score and percentage
        const percentage = calculatedTotal > 0 ? (calculatedScore / calculatedTotal) * 100 : 0;

        // Determine if passed based on company and stage
        const isPassed = calculatePassStatus(application.company, stageName, percentage, calculatedScore);

        // Create or update assessment stage
        const assessmentStage = await prisma.assessmentStage.upsert({
            where: {
                id: existingStage?.id || 'new',
            },
            create: {
                applicationId: id,
                stageName,
                score: calculatedScore,
                total: calculatedTotal,
                percentage,
                isPassed,
                timeSpent,
                submittedAt: new Date(),
            },
            update: {
                score: calculatedScore,
                total: calculatedTotal,
                percentage,
                isPassed,
                timeSpent,
                submittedAt: new Date(),
            },
        });

        // Store essay or code if provided
        if (essayText && stageName === 'essay') {
            // Store essay in a separate field or table if needed
            await prisma.assessmentStage.update({
                where: { id: assessmentStage.id },
                data: {
                    // You might want to add an essay field to the schema
                    // For now, we'll store it in a JSON field if available
                },
            });
        }

        // Update application status and determine next stage
        const nextStage = determineNextStage(application.company, stageName, isPassed);
        const newStatus = isPassed ? nextStage : 'rejected';

        await prisma.placementApplication.update({
            where: { id },
            data: {
                status: newStatus,
                currentStage: isPassed ? nextStage : stageName,
                finalDecision: isPassed ? undefined : 'rejected',
            },
        });

        // If all stages completed, assign track
        if (isPassed && isLastStage(application.company, nextStage)) {
            const track = await assignTrack(application.company, application.assessmentStages);
            await prisma.placementApplication.update({
                where: { id },
                data: {
                    finalTrack: track,
                    finalDecision: 'selected',
                    status: 'completed',
                },
            });

            return NextResponse.json({
                success: true,
                isPassed,
                nextStage: 'completed',
                track,
                message: `Congratulations! You have been selected for ${track} track.`,
            });
        }

        return NextResponse.json({
            success: true,
            isPassed,
            nextStage: isPassed ? nextStage : null,
            percentage,
            score,
            total,
        });
    } catch (error) {
        console.error('Error submitting stage:', error);
        return NextResponse.json(
            { error: 'Failed to submit stage assessment' },
            { status: 500 }
        );
    }
}

function calculatePassStatus(
    company: string,
    stageName: string,
    percentage: number,
    score: number
): boolean {
    if (company === 'TCS') {
        if (stageName === 'foundation') return percentage >= 60;
        if (stageName === 'advanced') return percentage >= 65;
        if (stageName === 'coding') return score >= 2; // At least 2 out of 3 problems
    } else if (company === 'Wipro') {
        if (stageName === 'aptitude') return percentage >= 65;
        if (stageName === 'essay') return percentage >= 70; // Based on AI scoring
        if (stageName === 'coding') return score >= 1; // At least 1 out of 2 problems
    }
    return false;
}

function determineNextStage(
    company: string,
    currentStage: string,
    isPassed: boolean
): string {
    if (!isPassed) return currentStage;

    if (company === 'TCS') {
        const stages = ['foundation', 'advanced', 'coding', 'interview', 'completed'];
        const currentIndex = stages.indexOf(currentStage);
        return stages[currentIndex + 1] || 'completed';
    } else if (company === 'Wipro') {
        const stages = ['aptitude', 'essay', 'coding', 'voice', 'interview', 'completed'];
        const currentIndex = stages.indexOf(currentStage);
        return stages[currentIndex + 1] || 'completed';
    }

    return 'completed';
}

function isLastStage(company: string, stage: string): boolean {
    if (company === 'TCS') {
        return stage === 'interview' || stage === 'completed';
    } else if (company === 'Wipro') {
        return stage === 'interview' || stage === 'completed';
    }
    return false;
}

async function assignTrack(
    company: string,
    stages: { stageName: string; percentage: number | null }[]
): Promise<string> {
    if (company === 'TCS') {
        // Digital track: Coding score >= 2.5/3 (83%+)
        // Ninja track: Coding score >= 2/3 (67%+)
        const codingStage = stages.find((s: any) => s.stageName === 'coding');
        if (codingStage) {
            const codingPercentage = codingStage.percentage || 0;
            if (codingPercentage >= 83) return 'Digital';
            if (codingPercentage >= 67) return 'Ninja';
        }
        return 'Ninja';
    } else if (company === 'Wipro') {
        // Turbo track: Overall average >= 80%
        // Elite track: Overall average >= 70%
        const totalPercentage = stages.reduce((sum: number, s: any) => sum + (s.percentage || 0), 0);
        const avgPercentage = totalPercentage / stages.length;

        if (avgPercentage >= 80) return 'Turbo';
        if (avgPercentage >= 70) return 'Elite';
        return 'Elite';
    }

    return 'Standard';
}
