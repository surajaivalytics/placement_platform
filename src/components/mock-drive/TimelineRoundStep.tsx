'use client';

import { motion } from 'framer-motion';
import { Lock, Play, CheckCircle, Clock, Flag, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface TimelineRoundStepProps {
    round: any;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'LOCKED';
    isLocked: boolean;
    driveId: string;
    progressId?: string;
    index: number;
    isRight: boolean;
}

export function TimelineRoundStep({ round, status, isLocked, driveId, progressId, index, isRight }: TimelineRoundStepProps) {
    const router = useRouter();
    const isActive = status === 'IN_PROGRESS' || status === 'PENDING';
    const isCompleted = status === 'COMPLETED';
    const isFailed = status === 'FAILED';

    const handleStart = () => {
        if (!isLocked) {
            router.push(`/placement/mock-drives/${driveId}/round/${round.id}`);
        }
    };

    const handleBypass = async () => {
        try {
            const res = await fetch(`/api/mock-drives/${driveId}/bypass`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roundId: round.id, roundNumber: round.roundNumber })
            });
            const data = await res.json();
            if (res.ok) {
                // toast.success("Round bypassed! Refreshing...");
                window.location.reload();
            } else {
                console.error(data.error);
                // toast.error("Failed to bypass: " + data.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className={`flex items-center justify-center w-full mb-16 last:mb-0 relative ${isRight ? 'flex-row' : 'flex-row-reverse'}`}>
            {/* Content Side */}
            <div className={`w-1/2 flex ${isRight ? 'justify-start pl-12' : 'justify-end pr-12'}`}>
                <motion.div
                    initial={{ opacity: 0, x: isRight ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`max-w-md w-full p-6 rounded-2xl border transition-all duration-300 ${isActive
                        ? 'bg-[#0f172a] text-white border-blue-500/30 shadow-2xl shadow-blue-500/10'
                        : isFailed
                            ? 'bg-white border-red-200 shadow-xl shadow-red-500/5'
                            : isLocked
                                ? 'bg-white opacity-60 border-gray-100 grayscale-[0.5]'
                                : 'bg-white border-gray-100 shadow-xl hover:shadow-2xl'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {isActive && (
                                <Badge className="bg-[#fbbf24] text-black hover:bg-[#d97706] border-none font-bold text-[10px] px-2 py-0">
                                    Suggested
                                </Badge>
                            )}
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                                Round {round.roundNumber}
                            </span>
                        </div>
                        {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                        {isFailed && (
                            <Badge variant="destructive" className="font-bold text-[10px] px-2 py-0">
                                Failed
                            </Badge>
                        )}
                        {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                        {round.title}
                    </h3>
                    <p className={`text-sm mb-6 line-clamp-2 ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
                        {round.description || "Comprehensive assessment round tailored for this drive's requirements."}
                    </p>

                    <div className="flex items-center gap-4 mb-6">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isActive ? 'bg-white/10 text-blue-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                            <Clock className="w-3.5 h-3.5" />
                            {round.durationMinutes} mins
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isActive ? 'bg-white/10 text-blue-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                            <Trophy className="w-3.5 h-3.5" />
                            {round.type.replace('_', ' ')}
                        </div>
                    </div>

                    <Button
                        disabled={isLocked || isCompleted}
                        onClick={handleStart}
                        className={`w-full h-11 text-sm font-bold rounded-xl transition-all ${isActive
                            ? 'bg-[#fbbf24] text-black hover:bg-[#f59e0b] shadow-[0_4px_0_rgb(217,119,6)] active:translate-y-1 active:shadow-none'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {isActive ? (
                            <><Play className="w-4 h-4 mr-2 fill-current" /> Start Simulation</>
                        ) : isCompleted ? (
                            'Completed'
                        ) : isFailed ? (
                            'Retry Round'
                        ) : isLocked ? (
                            'Locked'
                        ) : (
                            'Resume Round'
                        )}

                    </Button>

                    {isCompleted && (
                        <Button
                            onClick={() => router.push(`/placement/mock-drives/${driveId}/report/${progressId}`)}
                            className="w-full h-11 text-sm font-bold rounded-xl transition-all border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 mt-2"
                        >
                            View Performance Report
                        </Button>
                    )}

                    {/* DEV BYPASS BUTTON */}
                    {isActive && (
                        <div className="mt-2 text-center">
                            <Button
                                variant="link"
                                className="text-[10px] text-blue-300/50 hover:text-blue-300 h-auto p-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("DEV: Bypass this round?")) handleBypass();
                                }}
                            >
                                DEV: Bypass Round
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Center Timeline Node */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isActive
                    ? 'bg-[#fbbf24] border-white text-black shadow-lg'
                    : isCompleted
                        ? 'bg-green-500 border-white text-white'
                        : 'bg-gray-100 border-white text-gray-400'
                    }`}>
                    {index === 0 ? <Flag className="w-5 h-5" /> : <span className="text-sm font-bold">{index + 1}</span>}
                </div>
            </div>

            {/* Empty Side (For spacing/illustrations) */}
            <div className="w-1/2 flex items-center justify-center pointer-events-none">
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        {/* Placeholder for illustration or status badge like "Confidence Boosted" */}
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 absolute top-0 -left-20">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                                <Trophy className="w-4 h-4" />
                            </div>
                            <div className="pr-4">
                                <div className="text-[10px] font-bold text-gray-800">Confidence</div>
                                <div className="text-[10px] text-gray-500">Boosted</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
