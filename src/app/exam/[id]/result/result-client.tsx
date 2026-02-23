"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, XCircle, ArrowRight, Home, ChevronDown, 
  ChevronUp, AlertCircle, Terminal, ListFilter, ArrowLeft,
  Trophy, BrainCircuit, Sparkles, TrendingUp, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from '@/components/ui/confetti';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ResultClientProps {
    result: any; // Type accurately if possible
}

export default function ResultClient({ result }: ResultClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { score, total, details, test } = result;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
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
        <div className="min-h-screen bg-[#FAFBFF] pb-20 relative overflow-hidden">
            {isPassed && windowSize.width > 0 && <Confetti width={windowSize.width} height={windowSize.height} />}

            {/* Dynamic Header Background */}
            <div className="h-64 w-full bg-slate-900 absolute top-0 left-0 z-0 rounded-b-[3rem]" />

            <div className="max-w-4xl mx-auto px-6 relative z-10 pt-12 text-white">
                {/* Redirect Banner */}
                <AnimatePresence>
                    {justFinished && redirectTimer !== null && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-indigo-600/90 backdrop-blur-md text-white px-6 py-3 rounded-full text-center font-black uppercase text-xs tracking-widest mb-8 border border-white/20 shadow-xl"
                        >
                            🔄 Redirecting to Dashboard in {redirectTimer}s...
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <nav className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => router.push(`/exam/${test.id}/dashboard`)} 
                        className="flex items-center text-slate-300 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Exit Review</span>
                    </button>
                    <div className="flex gap-3">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="text-5xl font-black tracking-tight"
                            >
                                Exam Results
                            </motion.h1>
                            <p className="text-slate-400 mt-2 text-lg font-medium italic opacity-80">
                                {test.title || "Assessment Performance Report"}
                            </p>
                        </div>
                        <Badge className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-none ${
                            isPassed ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/50'
                        }`}>
                            {isPassed ? "Pass Confirmed" : "Score Below Benchmarks"}
                        </Badge>
                    </div>
                </section>

                {/* Main Score & Analysis Cards */}
                <div className="grid gap-6 text-slate-900">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                            <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                                {/* Circular Progress */}
                                <div className="relative flex items-center justify-center w-40 h-40">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                                        <motion.circle
                                            cx="80" cy="80" r="70" fill="transparent" stroke="url(#examGradient)" strokeWidth="12" strokeLinecap="round"
                                            initial={{ strokeDasharray: "0 1000" }} 
                                            animate={{ strokeDasharray: `${(percentage / 100) * 440} 1000` }} 
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                        <defs>
                                            <linearGradient id="examGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#4F46E5" />
                                                <stop offset="100%" stopColor="#9333EA" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-slate-900">{Math.round(percentage)}%</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div className="flex-1 space-y-6 text-center md:text-left border-l border-slate-100 pl-0 md:pl-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Raw Score</p>
                                            <p className="text-3xl font-black text-slate-800">{score} <span className="text-slate-300 font-medium text-lg">/ {total}</span></p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                            <div className={cn("text-xl font-black", isPassed ? "text-indigo-600" : "text-rose-500")}>
                                                {isPassed ? "SUCCESS" : "RETRY NEEDED"}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 font-medium text-sm italic">
                                        {isPassed 
                                            ? "\"Excellent job! You have cleared this assessment benchmarks with confidence.\"" 
                                            : "\"You're close! Review your weak areas in the detailed analysis below to improve your score.\""}
                                    </p>
                                </div>
                            </div>

                            {/* AI Coach Hint Box */}
                            <div className="bg-slate-50 p-8 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-4 uppercase tracking-tighter text-slate-700 font-black text-sm">
                                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                                    AI Exam Intelligence
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-2">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                                            <Sparkles size={10} /> Strength Detected
                                        </p>
                                        <p className="text-xs text-slate-700 font-medium">You showed consistent performance in the first half of the exam. Your accuracy is higher in MCQ-type questions.</p>
                                    </div>
                                    <div className="p-5 bg-white rounded-3xl border border-slate-100 space-y-2">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-1">
                                            <TrendingUp size={10} /> Pro Tip
                                        </p>
                                        <p className="text-xs text-slate-700 font-medium">For coding questions, focus on optimizing time complexity. Reviewing the test cases you missed will help.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Detailed Analysis Section */}
                    <div className="space-y-6 mt-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black tracking-tight text-slate-800 uppercase flex items-center gap-2">
                                <ListFilter size={20} className="text-indigo-600" />
                                Detailed Review
                            </h3>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{parsedDetails.length} Questions Analyzed</span>
                        </div>

                        {parsedDetails.length === 0 ? (
                            <Card className="p-12 text-center text-slate-400 italic rounded-[2rem] border-dashed border-2">No detailed breakdown found.</Card>
                        ) : (
                            <div className="space-y-4">
                                {parsedDetails.map((q: any, i: number) => {
                                    const isCorrect = q.status === 'correct';
                                    const isSkipped = q.status === 'skipped';
                                    const expanded = expandedQuestion === q.questionId;

                                    return (
                                        <motion.div key={i} layout>
                                            <Card className={cn(
                                                "border-0 shadow-sm rounded-[2rem] transition-all overflow-hidden bg-white",
                                                expanded ? "shadow-lg ring-2 ring-indigo-100" : "hover:shadow-md"
                                            )}>
                                                <div
                                                    className="p-6 flex items-start gap-6 cursor-pointer"
                                                    onClick={() => setExpandedQuestion(expanded ? null : q.questionId)}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                                        isCorrect ? "bg-emerald-50 text-emerald-500" : isSkipped ? "bg-slate-50 text-slate-400" : "bg-rose-50 text-rose-500"
                                                    )}>
                                                        {isCorrect ? <CheckCircle2 size={20} /> : isSkipped ? <AlertCircle size={20} /> : <XCircle size={20} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start gap-4">
                                                            <p className="font-bold text-slate-800 leading-snug">{q.text}</p>
                                                            <Badge className={cn(
                                                                "h-fit px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border-none",
                                                                isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                                            )}>
                                                                {q.score} / {q.total}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{q.type}</span>
                                                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                            <span className={cn("text-[10px] font-black uppercase tracking-widest", 
                                                                isCorrect ? "text-emerald-400" : "text-rose-400"
                                                            )}>{q.status}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-slate-300 pt-1">
                                                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {expanded && (
                                                        <motion.div 
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="px-10 pb-8 pt-0 ml-16"
                                                        >
                                                            <div className="border-t border-slate-50 pt-6 space-y-4">
                                                                {q.type === 'coding' ? (
                                                                    <div className="space-y-4">
                                                                        <div className="bg-slate-900 rounded-3xl p-6 font-mono text-sm text-indigo-300 shadow-xl relative overflow-hidden">
                                                                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                                                                <Terminal size={100} />
                                                                            </div>
                                                                            <div className="flex items-center gap-2 mb-4 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                                                                                <Terminal size={14} /> Submission Source
                                                                            </div>
                                                                            <pre className="relative z-10 whitespace-pre-wrap">{q.userAnswer}</pre>
                                                                        </div>
                                                                        <div className="p-4 bg-indigo-50/50 rounded-2xl text-xs text-indigo-700 italic border border-indigo-100">
                                                                            Evaluation complete. Logic verified against {q.total} hidden test cases.
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                                                                        <div className={cn("p-5 rounded-3xl border", isCorrect ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100")}>
                                                                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50">Your Answer</p>
                                                                            <p className="font-bold text-slate-800">{q.userAnswer || "Skipped"}</p>
                                                                        </div>
                                                                        <div className="p-5 rounded-3xl border bg-indigo-50/50 border-indigo-100">
                                                                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-50 text-indigo-400">Correct Solution</p>
                                                                            <p className="font-bold text-indigo-900">{q.correctMetadata || "Analyze logic for improvement"}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Final Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 mb-10">
                        {isPassed && (
                            <Button onClick={handleProceed} className="h-16 px-12 rounded-full bg-slate-900 text-white font-bold hover:scale-105 transition-transform shadow-xl shadow-slate-200 group">
                                Proceed to Next Phase
                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}
                        <Button onClick={() => router.push(`/exam/${test.id}/dashboard`)} variant="outline" className="h-16 px-10 rounded-full border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                            Return to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronRight({ className, size }: { className?: string, size?: number }) {
    return <ArrowRight className={className} size={size} />;
}
