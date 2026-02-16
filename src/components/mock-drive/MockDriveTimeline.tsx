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
        const currentRound = enrollment?.currentRoundNumber || 1;

        if (roundNum < currentRound) return 'COMPLETED';
        if (roundNum === currentRound) return enrollment?.status === 'FAILED' ? 'FAILED' : 'IN_PROGRESS';
        return 'PENDING';
    };

    const isRoundLocked = (roundNum: number) => {
        if (!enrollment) return true;
        const currentRound = enrollment?.currentRoundNumber || 1;
        return roundNum > currentRound;
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
