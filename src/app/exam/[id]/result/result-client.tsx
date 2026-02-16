"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight, Home, ChevronDown, ChevronUp, AlertCircle, Terminal, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from '@/components/ui/confetti';
import { toast } from "sonner";

interface ResultClientProps {
    result: any; // Type accurately if possible
}

export default function ResultClient({ result }: ResultClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { score, total, details, test } = result;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    // Verdict logic might be stored or calculated. 
    // Assuming passed if > 60%
    const isPassed = percentage >= 60;
    const justFinished = searchParams.get('justFinished') === 'true';

    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
    const [redirectTimer, setRedirectTimer] = useState<number | null>(null);

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    // Auto-redirect logic
    useEffect(() => {
        if (justFinished) {
            let timeLeft = 5;
            setRedirectTimer(timeLeft);

            const timer = setInterval(() => {
                timeLeft -= 1;
                setRedirectTimer(timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    // Exit strict mode if active
                    if (document.fullscreenElement) {
                        try {
                            document.exitFullscreen().catch(e => console.error(e));
                        } catch (e) { console.error(e); }
                    }
                    router.push(`/exam/${test.id}/dashboard`);
                }
            }, 1000);

            toast.info("Test Completed! Redirecting to dashboard in 5 seconds...");

            return () => clearInterval(timer);
        }
    }, [justFinished, router, test.id]);


    const handleProceed = () => {
        router.push(`/exam/${test.id}/dashboard`);
    };

    const parsedDetails = Array.isArray(details) ? details : [];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            {isPassed && windowSize.width > 0 && <Confetti width={windowSize.width} height={windowSize.height} />}

            <div className="max-w-5xl mx-auto space-y-8">

                {/* Redirect Banner */}
                {justFinished && redirectTimer !== null && (
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-bold animate-pulse">
                        Redirecting to Dashboard in {redirectTimer}s...
                    </div>
                )}


                {/* Hero Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Score Card */}
                    <Card className="col-span-1 md:col-span-2 bg-white shadow-xl rounded-2xl overflow-hidden relative p-8 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div>
                            <h2 className="text-gray-500 font-medium tracking-wide uppercase text-sm mb-2">Total Score</h2>
                            <div className="flex items-baseline gap-2">
                                <span className={cn("text-6xl font-extrabold tracking-tighter", isPassed ? "text-green-600" : "text-gray-900")}>{score}</span>
                                <span className="text-2xl text-gray-400">/ {total}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-3">
                                <div className={cn("px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2", isPassed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}
                                </div>
                                <span className="text-gray-500 font-medium">{percentage}% Score</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            {isPassed ? (
                                <p className="text-gray-600">Great job! You have cleared this assessment and are ready for the next round.</p>
                            ) : (
                                <p className="text-gray-600">You missed the cutoff by {60 - percentage}%. Review your answers below and try again.</p>
                            )}
                        </div>

                        <div className="mt-8 flex gap-3">
                            {isPassed && <Button onClick={handleProceed} className="bg-[#181C2E] text-white hover:bg-gray-800 h-12 px-6">Proceed Next <ArrowRight className="w-4 h-4 ml-2" /></Button>}
                            <Button onClick={() => router.push(`/exam/${test.id}/dashboard`)} variant="outline" className="h-12">Return to Dashboard</Button>
                        </div>
                    </Card>

                    {/* Stats / AI Insight Placeholder */}
                    <Card className="col-span-1 bg-[#181C2E] text-white p-8 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden">
                        <div className="relative z-10 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center backdrop-blur text-2xl">
                                🧠
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">AI Analysis</h3>
                                <p className="text-white/60 text-sm mt-1">Coming Soon</p>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed">
                                Detailed insights into your weak areas and topic recommendations will appear here.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Detailed Analysis */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ListFilterIcon className="w-5 h-5" /> Detailed Analysis
                    </h3>

                    {parsedDetails.length === 0 ? (
                        <Card className="p-8 text-center text-gray-500">No detailed breakdown available for this attempt.</Card>
                    ) : (
                        <div className="space-y-4">
                            {parsedDetails.map((q: any, i: number) => {
                                const isCorrect = q.status === 'correct';
                                const isSkipped = q.status === 'skipped';
                                const expanded = expandedQuestion === q.questionId;

                                return (
                                    <Card key={i} className={cn("border transition-all duration-200", expanded ? "shadow-md ring-1 ring-blue-500/20" : "hover:bg-gray-50")}>
                                        <div
                                            className="p-4 flex items-start gap-4 cursor-pointer"
                                            onClick={() => setExpandedQuestion(expanded ? null : q.questionId)}
                                        >
                                            <div className={cn("mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                                                isCorrect ? "bg-green-100 text-green-600" : isSkipped ? "bg-gray-100 text-gray-500" : "bg-red-100 text-red-600")}>
                                                {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : isSkipped ? <AlertCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="font-medium text-gray-900 line-clamp-2">{q.text}</p>
                                                    <span className={cn("text-xs font-bold px-2 py-1 rounded ml-2 whitespace-nowrap",
                                                        isCorrect ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                                                        {q.score} / {q.total}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span className="capitalize">{q.type}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{q.status}</span>
                                                </div>
                                            </div>
                                            <div className="text-gray-400">
                                                {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </div>
                                        </div>

                                        {expanded && (
                                            <div className="px-4 pb-4 pt-0 pl-14 space-y-3">
                                                <hr className="border-gray-100 mb-3" />
                                                {q.type === 'coding' ? (
                                                    <div className="space-y-2">
                                                        <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-gray-300 overflow-x-auto">
                                                            <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-700 pb-1">
                                                                <Terminal className="w-4 h-4" /> Your Code
                                                            </div>
                                                            <pre>{q.userAnswer}</pre>
                                                        </div>
                                                        <p className="text-xs text-gray-500 italic">Check passed status for test cases.</p>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div className={cn("p-3 rounded-lg border", isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                                                            <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Your Answer</p>
                                                            <p className="font-medium">{q.userAnswer || "Skipped"}</p>
                                                        </div>
                                                        <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                                                            <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70 text-blue-800">Correct Answer</p>
                                                            <p className="font-medium text-blue-900">{q.correctMetadata || "See Explanation"}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ListFilterIcon({ className }: any) {
    return <ListFilter className={className} />
}
