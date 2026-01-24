"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

export default function MockTestResultPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const testId = params.id as string;

    const score = parseInt(searchParams.get('score') || '0');
    const total = parseInt(searchParams.get('total') || '0');
    const verdict = searchParams.get('verdict') as 'Passed' | 'Failed' | null;
    const type = searchParams.get('type') || 'assessment'; // 'assessment', 'technical', 'hr'

    // Calculate percentage
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const isPassed = verdict === 'Passed' || (type === 'assessment' ? percentage >= 60 : true); // Default true for interviews if they reach here as Passed

    // Animation state
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isPassed) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        }
    }, [isPassed]);

    const handleProceed = () => {
        if (type === 'assessment') {
            router.push('/tcs-portal/interview?type=technical');
        } else if (type === 'technical') {
            router.push('/tcs-portal/interview?type=hr');
        } else {
            router.push(`/exam/${testId}/dashboard`);
        }
    };

    const handleDashboard = () => {
        router.push(`/exam/${testId}/dashboard`);
    };

    const getNextButtonText = () => {
        if (type === 'assessment') return "Proceed to Technical Interview";
        if (type === 'technical') return "Proceed to HR Interview";
        return "Go to Dashboard";
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            {showConfetti && <div className="fixed inset-0 pointer-events-none z-50"><Confetti /></div>}

            <Card className="max-w-xl w-full bg-white shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
                <div className={cn("p-8 text-center", isPassed ? "bg-green-50" : "bg-red-50")}>
                    <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        {isPassed ? (
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-600" />
                        )}
                    </div>
                    <h1 className={cn("text-3xl font-bold mb-2", isPassed ? "text-green-800" : "text-red-800")}>
                        {isPassed ? "Congratulations!" : "Don't Give Up!"}
                    </h1>
                    <p className="text-gray-600 font-medium">
                        {isPassed
                            ? "You have successfully cleared the assessment."
                            : "You did not meet the cutoff criteria this time."}
                    </p>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Score</div>
                            <div className="text-3xl font-bold text-gray-900 mt-1">{score}/{total}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Percentage</div>
                            <div className={cn("text-3xl font-bold mt-1", isPassed ? "text-green-600" : "text-red-600")}>
                                {percentage}%
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4">
                        {isPassed ? (
                            <Button
                                onClick={handleProceed}
                                className="w-full h-14 text-lg bg-[#181C2E] hover:bg-gray-800 shadow-lg group"
                            >
                                {getNextButtonText()}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => router.push(`/exam/${testId}/test`)}
                                variant="outline"
                                className="w-full h-14 text-lg border-2"
                            >
                                Retake Assessment
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            className="w-full text-gray-500"
                            onClick={handleDashboard}
                        >
                            <Home className="w-4 h-4 mr-2" /> Back to Dashboard
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// Simple Confetti Placeholder if component missing
function Confetti() {
    return (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-10%`,
                        animationDuration: `${Math.random() * 2 + 1}s`,
                        animationDelay: `${Math.random()}s`,
                        backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308'][Math.floor(Math.random() * 4)]
                    }}
                />
            ))}
        </div>
    )
}
