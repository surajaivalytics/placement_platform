'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ChevronLeft, Award, Target, BookOpen, Brain, Sparkles, 
  CheckCircle, XCircle, ArrowLeft, Trophy, BrainCircuit, 
  TrendingUp, TrendingDown, ChevronRight
} from "lucide-react";
import { Spinner } from "@/components/ui/loader";
import { motion, AnimatePresence } from "framer-motion";

interface ResultData {
  id: string;
  score: number;
  total: number;
  percentage: number;
  aiFeedback: string | null;
  createdAt: string;
  test: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
  };
}

interface AIFeedback {
  summary: string;
  strengths: string;
  improvements: string;
  advice: string;
}

export default function ResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ailoading, setAiloading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const resultId = params.id as string;
        const response = await fetch(`/api/results?id=${resultId}`);
        if (!response.ok) throw new Error('Failed to fetch result');
        const data = await response.json();
        setResult(data.result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchResult();
  }, [params.id]);

  useEffect(() => {
    if (!result) return;
    const fetchAifeedBack = async () => {
      setAiloading(true);
      try {
        const percentage = typeof result.percentage === 'number' && !isNaN(result.percentage) ? result.percentage : 0;
        const response = await fetch("/api/ai-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: result.score,
            total: result.total,
            percentage: percentage,
            testTitle: result.test.title,
            difficulty: result.test.difficulty,
          })
        });
        const data = await response.json();
        if (data.success) setAiFeedback(data.feedback);
      } catch (error) {
        console.error("AI feedback error:", error);
      } finally {
        setAiloading(false);
      }
    };
    fetchAifeedBack();
  }, [result]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      <div className="relative flex items-center justify-center">
        <Spinner size={64} />
      </div>
      <p className="mt-4 text-slate-400 font-medium tracking-wide italic">Retrieving your analysis...</p>
    </div>
  );

  if (error || !result) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Result Not Found</h2>
      <Button asChild><Link href="/dashboard">Return to Dashboard</Link></Button>
    </div>
  );

  const safePercentage = typeof result.percentage === 'number' && !isNaN(result.percentage) ? result.percentage : 0;
  const isPassed = safePercentage >= 60;
  const statusLabel = safePercentage >= 70 ? 'Mastered' : 'Growing';

  return (
    <div className="min-h-screen bg-[#FAFBFF] pb-20">
      {/* Dynamic Header Background */}
      <div className="h-64 w-full bg-slate-900 absolute top-0 left-0 z-0 rounded-b-[3rem]" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 pt-12">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to History</span>
          </button>
          <div className="flex gap-3">
            <Badge variant="outline" className="px-3 py-1 bg-white/10 text-white border-white/20 backdrop-blur-md uppercase text-[10px] font-bold">
              {result.test.difficulty}
            </Badge>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="text-white mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-5xl font-black tracking-tight"
          >
            {result.test.title}
          </motion.h1>
          <p className="text-slate-400 mt-2 text-lg font-medium italic opacity-80">
            Performance Report • {new Date(result.createdAt).toLocaleDateString()}
          </p>
        </section>

        {/* Main Score & AI Feedback */}
        <div className="grid gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-0 shadow-2xl shadow-indigo-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="relative flex items-center justify-center w-40 h-40">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                    <motion.circle
                      cx="80" cy="80" r="70" fill="transparent" stroke="url(#scoreGradient)" strokeWidth="12" strokeLinecap="round"
                      initial={{ strokeDasharray: "0 1000" }} 
                      animate={{ strokeDasharray: `${(safePercentage / 100) * 440} 1000` }} 
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#9333EA" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-900">{Math.round(safePercentage)}%</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-8 w-full border-l border-slate-100 pl-0 md:pl-10">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Accuracy</p>
                    <p className="text-2xl font-black text-slate-800">{result.score} <span className="text-slate-300 font-medium">/ {result.total}</span></p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Attempted On</p>
                    <p className="text-2xl font-black text-slate-800">{new Date(result.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="col-span-2">
                    <Badge className={`border-none px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                      isPassed ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      Status: {statusLabel}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* AI Coaching Feedback */}
              <div className="bg-slate-50 p-8 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black uppercase tracking-tighter text-slate-700">AI Performance Analysis</h3>
                </div>
                {ailoading ? (
                  <div className="flex gap-2 items-center py-4">
                    <Spinner size={16} />
                    <span className="text-xs text-slate-400">Personalizing your insights...</span>
                  </div>
                ) : aiFeedback ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <p className="text-sm text-slate-600 leading-relaxed italic md:col-span-2">"{aiFeedback.summary}"</p>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-emerald-500 uppercase mb-1 flex items-center gap-1">
                        <TrendingUp size={10} /> Key Strengths
                      </p>
                      <p className="text-xs text-slate-700 font-medium">{aiFeedback.strengths}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-rose-400 uppercase mb-1 flex items-center gap-1">
                        <TrendingDown size={10} /> Focus Areas
                      </p>
                      <p className="text-xs text-slate-700 font-medium">{aiFeedback.improvements}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Analysis temporarily unavailable.</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg rounded-[2.5rem] bg-indigo-600 p-8 text-white relative overflow-hidden group">
              <Brain className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
              <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2">Coach's Pro-Tip</p>
              <h4 className="text-lg font-bold italic leading-relaxed relative z-10">
                "{aiFeedback?.advice || "Keep practicing consistently to see exponential growth in your understanding."}"
              </h4>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm rounded-[2rem] bg-white p-5 flex flex-col items-center justify-center text-center">
                <Target className="text-indigo-600 mb-2" size={20} />
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Correct</p>
                <p className="text-xl font-black text-slate-800">{result.score}</p>
              </Card>
              <Card className="border-0 shadow-sm rounded-[2rem] bg-white p-5 flex flex-col items-center justify-center text-center">
                <BookOpen className="text-indigo-600 mb-2" size={20} />
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total</p>
                <p className="text-xl font-black text-slate-800">{result.total}</p>
              </Card>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button asChild className="h-14 px-10 rounded-full bg-slate-900 text-white font-bold hover:scale-105 transition-transform shadow-xl shadow-slate-200">
              <Link href="/dashboard/my-tests">Retake Assessment</Link>
            </Button>
            <Button asChild variant="outline" className="h-14 px-10 rounded-full border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
