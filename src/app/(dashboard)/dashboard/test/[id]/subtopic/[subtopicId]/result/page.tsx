'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, XCircle, ArrowLeft, RotateCcw, 
  List, Trophy, Target, Zap, TrendingUp, 
  Award, Star, BrainCircuit, Sparkles, ChevronRight
} from "lucide-react";
import { Spinner } from "@/components/ui/loader";
import { motion, AnimatePresence } from "framer-motion";

function SubtopicResultContent({ 
  params 
}: { 
  params: Promise<{ id: string; subtopicId: string }> 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [testId, setTestId] = useState<string>('');
  const [subtopicId, setSubtopicId] = useState<string>('');
  const [testTitle, setTestTitle] = useState<string>('');
  const [subtopicName, setSubtopicName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const percentage = parseFloat(searchParams.get('percentage') || '0');

  useEffect(() => {
    params.then(({ id, subtopicId: subId }) => {
      setTestId(id);
      setSubtopicId(subId);
      
      // Fetch test and subtopic info for UI consistency
      Promise.all([
        fetch(`/api/tests?id=${id}`).then(res => res.json()),
        fetch(`/api/tests/${id}/subtopics`).then(res => res.json())
      ]).then(([testData, subtopicsData]) => {
        if (testData.test) setTestTitle(testData.test.title);
        if (subtopicsData.subtopics) {
          const subtopic = subtopicsData.subtopics.find((s: any) => s.id === subId);
          if (subtopic) setSubtopicName(subtopic.name);
        }
      }).finally(() => setLoading(false));
    });
  }, [params]);

  const isPassed = percentage >= 60;
  const statusLabel = percentage >= 70 ? 'Mastered' : 'Growing';

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-white">
      <div className="relative flex items-center justify-center">
        <Spinner size={64} />
      </div>
      <p className="mt-4 text-slate-400 font-medium tracking-wide italic">Generating your result...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFBFF] pb-20">
      {/* Dynamic Header Background */}
      <div className="h-64 w-full bg-slate-900 absolute top-0 left-0 z-0 rounded-b-[3rem]" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 pt-12">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.push(`/dashboard/test/${testId}/subtopics`)} 
            className="flex items-center text-slate-300 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">All Subtopics</span>
          </button>
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
        </nav>

        {/* Hero Section */}
        <section className="text-white mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-5xl font-black tracking-tight"
          >
            {subtopicName || 'Result'}
          </motion.h1>
          <p className="text-slate-400 mt-2 text-lg font-medium italic opacity-80">
            {testTitle || 'Performance Report'}
          </p>
        </section>

        {/* Main Score Card */}
        <div className="grid gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-0 shadow-2xl shadow-indigo-200/50 rounded-[2.5rem] overflow-hidden bg-white">
              <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                {/* Circular Progress */}
                <div className="relative flex items-center justify-center w-40 h-40">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                    <motion.circle
                      cx="80" cy="80" r="70" fill="transparent" stroke="url(#scoreGradient)" strokeWidth="12" strokeLinecap="round"
                      initial={{ strokeDasharray: "0 1000" }} 
                      animate={{ strokeDasharray: `${(percentage / 100) * 440} 1000` }} 
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
                    <span className="text-4xl font-black text-slate-900">{Math.round(percentage)}%</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
                  </div>
                </div>

                {/* Score stats */}
                <div className="flex-1 grid grid-cols-2 gap-8 w-full border-l border-slate-100 pl-0 md:pl-10">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Correct Answers</p>
                    <p className="text-2xl font-black text-slate-800">{score} <span className="text-slate-300 font-medium">/ {total}</span></p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Accuracy</p>
                    <p className="text-2xl font-black text-slate-800">{Math.round(percentage)}%</p>
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

              {/* Motivational Insight Section - Reusing AI Feedback style */}
              <div className="bg-slate-50 p-8 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-black uppercase tracking-tighter text-slate-700">Performance Insight</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <p className="text-sm text-slate-600 leading-relaxed italic md:col-span-2">
                    {isPassed 
                      ? "\"Your dedication is showing! You've successfully navigated through this topic with a solid understanding.\"" 
                      : "\"Every challenge is an opportunity to learn. This topic needs a bit more focus, but you're definitely capable of mastering it.\""}
                  </p>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Key Insight</p>
                    <p className="text-xs text-slate-700 font-medium">
                      {percentage >= 90 ? "Excellent mastery. You can now confidently apply these concepts." : 
                       percentage >= 70 ? "Good progress. A few more practice sessions will help solidify your knowledge." :
                       "Reviewing the core principles will help bridge the current understanding gap."}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-rose-400 uppercase mb-1">Strategy</p>
                    <p className="text-xs text-slate-700 font-medium">
                      {isPassed ? "Keep building on this momentum and try more advanced topics." : "Try retaking the test after a quick revision of the missed questions."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="border-0 shadow-lg rounded-[2rem] bg-white p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
              onClick={() => router.push(`/dashboard/test/${testId}/subtopic/${subtopicId}`)}
            >
              <div>
                <RotateCcw className="text-indigo-600 mb-2 group-hover:rotate-180 transition-transform duration-500" size={20} />
                <h4 className="text-slate-900 font-bold">Retry Test</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Perfect your score</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                <ChevronRight className="w-5 h-5 text-indigo-600" />
              </div>
            </Card>

            <Card 
              className="border-0 shadow-lg rounded-[2rem] bg-white p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
              onClick={() => router.push(`/dashboard/test/${testId}/subtopics`)}
            >
              <div>
                <List className="text-slate-600 mb-2" size={20} />
                <h4 className="text-slate-900 font-bold">All Subtopics</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">View progress</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-2xl group-hover:bg-slate-200 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </div>
            </Card>
          </div>

          {/* Primary Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button 
              onClick={() => router.push('/dashboard/topics')} 
              className="h-14 px-10 rounded-full bg-slate-900 text-white font-bold hover:scale-105 transition-transform shadow-xl shadow-slate-200"
            >
              Continue Learning
            </Button>
          </div>

          <div className="mt-8 text-center text-slate-400 text-sm font-medium italic opacity-60">
            {isPassed ? "Outstanding! You're making great progress." : "Don't give up! Every mistake is a lesson learned."}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubtopicResultPage({ 
  params 
}: { 
  params: Promise<{ id: string; subtopicId: string }> 
}) {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <Spinner size={64} />
        <p className="mt-4 text-slate-400 font-medium tracking-wide italic">Loading results...</p>
      </div>
    }>
      <SubtopicResultContent params={params} />
    </Suspense>
  );
}
