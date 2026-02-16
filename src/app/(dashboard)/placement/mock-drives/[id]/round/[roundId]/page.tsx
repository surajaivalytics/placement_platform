'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MCQInterface } from '@/components/mock-drive/MCQInterface';
import { CodingInterface } from '@/components/mock-drive/CodingInterface';
import { AIInterviewRunner } from '@/components/interview/ai-interview-runner';
import { RoundInstructions } from '@/components/mock-drive/RoundInstructions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function MockRoundPage() {
    const params = useParams();
    const router = useRouter();
    const driveId = params.id as string;
    const roundId = params.roundId as string;

    const [loading, setLoading] = useState(true);
    const [round, setRound] = useState<any>(null);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoundData = async () => {
            try {
                setLoading(true);
                const [progressRes, roundsRes] = await Promise.all([
                    fetch(`/api/mock-drives/${driveId}/progress`),
                    fetch(`/api/mock-drives/${driveId}/rounds`)
                ]);

                const progressData = await progressRes.json();
                const roundsData = await roundsRes.json();

                if (!progressRes.ok || !roundsRes.ok) throw new Error('Failed to load data');

                // Find the round by ID from the URL
                const currentRound = roundsData.rounds.find((r: any) => r.id === roundId);

                if (!currentRound) {
                    // Fallback: maybe the URL param is roundNumber? 
                    // If URL is /round/1, we check roundNumber
                    const roundByNum = roundsData.rounds.find((r: any) => r.roundNumber.toString() === roundId);
                    if (roundByNum) {
                        // It was a number, use it
                        setRound(roundByNum);
                        // Check lock
                        if (roundByNum.roundNumber > (progressData.enrollment?.currentRoundNumber || 1)) {
                            router.push(`/placement/mock-drives/${driveId}`);
                            return;
                        }
                        setEnrollment(progressData.enrollment);
                        return;
                    }
                    throw new Error('Round not found');
                }

                // Check lock status
                if (currentRound.roundNumber > (progressData.enrollment?.currentRoundNumber || 1)) {
                    router.push(`/placement/mock-drives/${driveId}`);
                    return;
                }

                if (!progressData.enrollment) {
                    toast.error("You must register for the drive first.");
                    router.push(`/placement/mock-drives/${driveId}`);
                    return;
                }

                setRound(currentRound);
                setEnrollment(progressData.enrollment);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (driveId && roundId) {
            fetchRoundData();
        }
    }, [driveId, roundId, router]);

    const [showInstructions, setShowInstructions] = useState(true);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!round) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    if (showInstructions) {
        return <RoundInstructions round={round} onStart={() => setShowInstructions(false)} />;
    }

    const isInterview = round.type === 'TECH_INTERVIEW' || round.type === 'HR_INTERVIEW';

    return (
        <div className={cn(
            "min-h-screen",
            isInterview ? "bg-[#0a192f] p-0" : "bg-slate-50 py-8"
        )}>
            <div className={cn(
                "mx-auto px-4",
                isInterview ? "max-w-none px-0 h-screen" : "max-w-7xl"
            )}>
                {/* Header / Info - Only for non-interview rounds */}
                {!isInterview && (
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">{round.title}</h1>
                        <p className="text-slate-500">{round.description}</p>
                    </div>
                )}

                {/* Render specific interface based on type */}
                {round.type === 'MCQ' && (
                    <MCQInterface round={round} enrollment={enrollment} />
                )}
                {round.type === 'CODING' && (
                    <CodingInterface round={round} enrollment={enrollment} />
                )}
                {isInterview && (
                    <div className="h-full w-full">
                        <AIInterviewRunner
                            interviewType={round.type === 'TECH_INTERVIEW' ? 'Technical' : 'HR'}
                            companyName={enrollment?.drive?.company || 'Company'}
                            onFinish={() => {
                                toast.success("Interview Round Completed");
                                router.push(`/placement/mock-drives/${driveId}`);
                            }}
                            enrollmentId={enrollment.id}
                            roundId={round.id}
                            topics={round.metadata?.topics}
                            companyContext={round.metadata?.companyContext}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
