'use client';

import { TimelineRoundStep } from './TimelineRoundStep';

interface MockDriveTimelineProps {
    rounds: any[];
    enrollment: any;
    driveId: string;
}

export function MockDriveTimeline({ rounds, enrollment, driveId }: MockDriveTimelineProps) {

    const getRoundStatus = (roundNum: number) => {
        if (!enrollment) return 'LOCKED';
        if (enrollment?.status === 'PASSED') return 'COMPLETED';

        const round = rounds.find(r => r.roundNumber === roundNum);
        const progress = round ? enrollment?.roundProgress?.find((rp: any) => rp.roundId === round.id) : null;
        if (progress?.status) {
            return progress.status;
        }

        const currentRound = enrollment?.currentRoundNumber || 1;

        if (roundNum < currentRound) return 'COMPLETED';
        if (roundNum === currentRound) return enrollment?.status === 'FAILED' ? 'FAILED' : 'IN_PROGRESS';
        return 'PENDING';
    };

    const isRoundLocked = (roundNum: number) => {
        if (!enrollment) return true;

        // If the drive is passed or failed entirely, no more rounds unlock
        if (enrollment?.status === 'PASSED') return false;

        let highestCompletedRoundNum = 0;
        if (enrollment?.roundProgress) {
            enrollment.roundProgress.forEach((rp: any) => {
                const r = rounds.find(round => round.id === rp.roundId);
                if (r && rp.status === 'COMPLETED' && r.roundNumber > highestCompletedRoundNum) {
                    highestCompletedRoundNum = r.roundNumber;
                }
            });
        }

        // Allowed to access if the round is less than or equals to (highest completed + 1)
        // OR if it's the currentRoundNumber tracked by enrollment
        const currentRound = enrollment?.currentRoundNumber || 1;
        const maxAllowedRound = Math.max(currentRound, highestCompletedRoundNum + 1);

        return roundNum > maxAllowedRound;
    };

    return (
        <div className="relative py-12">
            {/* Central Vertical Baseline */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-100 via-blue-200 to-transparent rounded-full" />

            {/* Steps */}
            <div className="relative z-10 w-full">
                {rounds.map((round, index) => (
                    <TimelineRoundStep
                        key={round.id}
                        round={round}
                        index={index}
                        isRight={index % 2 === 0}
                        status={getRoundStatus(round.roundNumber)}
                        isLocked={isRoundLocked(round.roundNumber)}
                        driveId={driveId}
                        progressId={enrollment?.roundProgress?.find((rp: any) => rp.roundId === round.id)?.id}
                    />
                ))}
            </div>
        </div>
    );
}
