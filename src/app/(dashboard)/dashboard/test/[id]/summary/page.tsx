'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy, TrendingUp, TrendingDown,
  ArrowLeft, RotateCcw, Sparkles, BrainCircuit, ChevronRight
} from "lucide-react";
import { Spinner } from "@/components/ui/loader";
import { motion, AnimatePresence } from "framer-motion";

interface SubtopicProgress {
  id: string;
  name: string;
  progress: {
    score: number;
    total: number;
    percentage: number;
    completed: boolean;
  } | null;
}

interface AiFeedbackData {
  summary: string;
  strengths: string;
  improvements: string;
  advice: string;
}

export default function TopicSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [testId, setTestId] = useState<string>('');
  const [testTitle, setTestTitle] = useState<string>('');
  const [subtopics, setSubtopics] = useState<SubtopicProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiFeedback, setAiFeedback] = useState<AiFeedbackData | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  useEffect(() => {
    params.then(({ id }) => {
      setTestId(id);
      fetch(`/api/tests?id=${id}`).then(res => res.json()).then(data => data.test && setTestTitle(data.test.title));
      fetch(`/api/tests/${id}/subtopics`).then(res => res.json()).then(data => {
        if (data.subtopics) setSubtopics(data.subtopics.filter((s: any) => s.progress?.completed));
      }).finally(() => setLoading(false));
    });
  }, [params]);

  const totalScore = useMemo(() => subtopics.reduce((sum, s) => sum + (s.progress?.score || 0), 0), [subtopics]);
  const totalQuestions = useMemo(() => subtopics.reduce((sum, s) => sum + (s.progress?.total || 0), 0), [subtopics]);
  const overallPercentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;

  useEffect(() => {
    if (subtopics.length === 0 || aiFeedback || loading) return;
    const fetchAifeedBack = async () => {
      setAiLoading(true);
      try {
        const res = await fetch("/api/ai-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score: totalScore, total: totalQuestions, percentage: overallPercentage, testTitle, subtopics: subtopics })
        });
        const data = await res.json();
        if (data.success) setAiFeedback(data.feedback);
      } finally { setAiLoading(false); }
    };
    fetchAifeedBack();
  }, [subtopics.length, aiFeedback, loading, totalScore, totalQuestions, overallPercentage, testTitle]);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      <div className="relative flex items-center justify-center">
        <Spinner size={64} />
      </div>
      <p className="mt-4 text-slate-400 font-medium tracking-wide italic">Analyzing your growth...</p>
    </div>
  );

  const sorted = [...subtopics].sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0));
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  return (
    <div className="min-h-screen bg-[#FAFBFF] pb-20">
      {/* Dynamic Header Background */}
      <div className="h-64 w-full bg-slate-900 absolute top-0 left-0 z-0 rounded-b-[3rem]" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 pt-12">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <button onClick={() => router.push('/dashboard/topics')} className="flex items-center text-slate-300 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Exit Report</span>
          </button>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
        </nav>

        {/* Hero Section */}
        <section className="text-white mb-10">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-black tracking-tight">{testTitle}</motion.h1>
          <p className="text-slate-400 mt-2 text-lg font-medium italic opacity-80">Summary of your learning journey</p>
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
                      initial={{ strokeDasharray: "0 1000" }} animate={{ strokeDasharray: `${(overallPercentage / 100) * 440} 1000` }} transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4F46E5" />
                        <stop offset="100%" stopColor="#9333EA" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-900">{Math.round(overallPercentage)}%</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-8 w-full border-l border-slate-100 pl-0 md:pl-10">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total Accuracy</p>
                    <p className="text-2xl font-black text-slate-800">{totalScore} <span className="text-slate-300 font-medium">/ {totalQuestions}</span></p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Subtopics</p>
                    <p className="text-2xl font-black text-slate-800">{subtopics.length}</p>
                  </div>
                  <div className="col-span-2">
                    <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-50 border-none px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      Status: {overallPercentage >= 70 ? 'Mastered' : 'Growing'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Seamless AI Integration */}
              <div className="bg-slate-50 p-8 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black uppercase tracking-tighter text-slate-700">AI Tutor Analysis</h3>
                </div>
                {aiLoading ? (
                  <div className="flex gap-2 items-center"><Spinner size={16} /><span className="text-xs text-slate-400">Processing insights...</span></div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <p className="text-sm text-slate-600 leading-relaxed italic md:col-span-2">"{aiFeedback?.summary}"</p>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Key Insight</p>
                      <p className="text-xs text-slate-700 font-medium">{aiFeedback?.advice}</p>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Focus On</p>
                      <p className="text-xs text-slate-700 font-medium">{aiFeedback?.improvements}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Strongest/Weakest Quick Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg rounded-[2rem] bg-emerald-50/50 p-6 flex items-center justify-between">
              <div>
                <TrendingUp className="text-emerald-600 mb-2" size={20} />
                <h4 className="text-slate-900 font-bold">{strongest?.name}</h4>
                <p className="text-emerald-700/60 text-xs font-bold">Mastered</p>
              </div>
              <div className="text-2xl font-black text-emerald-600">{Math.round(strongest?.progress?.percentage || 0)}%</div>
            </Card>

            <Card className="border-0 shadow-lg rounded-[2rem] bg-rose-50/50 p-6 flex items-center justify-between">
              <div>
                <TrendingDown className="text-rose-600 mb-2" size={20} />
                <h4 className="text-slate-900 font-bold">{weakest?.name}</h4>
                <button onClick={() => router.push(`/dashboard/test/${testId}/subtopic/${weakest?.id}`)} className="text-rose-700/60 text-xs font-bold flex items-center gap-1 hover:text-rose-700 transition-colors">
                  Fix this spot <RotateCcw size={10} />
                </button>
              </div>
              <div className="text-2xl font-black text-rose-600">{Math.round(weakest?.progress?.percentage || 0)}%</div>
            </Card>
          </div>

          {/* Topic List */}
          <div className="mt-6">
            <h2 className="text-slate-900 font-black text-xl mb-6 flex items-center gap-2 px-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Detailed Breakdown
            </h2>
            <div className="space-y-3">
              {subtopics.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="bg-white hover:bg-slate-50 transition-colors p-5 rounded-3xl border border-slate-100 flex items-center group cursor-default">
                    <div className="flex-1">
                      <h5 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{s.name}</h5>
                      <div className="flex gap-4 mt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.progress?.score} / {s.progress?.total} Correct</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <span className="text-sm font-black text-slate-900">{Math.round(s.progress?.percentage || 0)}%</span>
                      <ChevronRight className="w-4 h-4 text-slate-200" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button onClick={() => router.push('/dashboard/topics')} className="h-14 px-10 rounded-full bg-slate-900 text-white font-bold hover:scale-105 transition-transform shadow-xl shadow-slate-200">
              Continue Learning
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
}