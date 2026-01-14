'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  CheckCircle, XCircle, Loader2, Sparkles,
  ChevronLeft, Award, Target, BookOpen, Brain
} from "lucide-react";

interface ResultData {
  id: string;
  score: number;
  total: number;
  percentage: number;
  aiFeedback: string | null;
  createdAt: string;
  test: {
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
        const response = await fetch("/api/ai-feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: result.score,
            total: result.total,
            percentage: result.percentage,
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
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      <p className="text-slate-500 font-medium">Loading your results...</p>
    </div>
  );

  if (error || !result) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Oops! Result Not Found</h2>
      <Button asChild><Link href="/dashboard">Return to Dashboard</Link></Button>
    </div>
  );

  const scoreColor = result.percentage >= 80 ? 'text-emerald-600' : result.percentage >= 60 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2 -ml-2 text-slate-500 hover:text-slate-900">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to History
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Report Summary</h1>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-white shadow-sm capitalize">
            {result.test.difficulty} Difficulty
          </Badge>
          <Badge className="px-3 py-1 bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-50 shadow-sm">
            {result.test.type}
          </Badge>
        </div>
      </div>

      {/* Hero Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none bg-slate-900 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Award size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-slate-400 font-medium uppercase tracking-wider text-xs">Overall Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6 text-center">
            <div className="relative flex items-center justify-center mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * result.percentage) / 100} className="text-indigo-400 transition-all duration-1000" />
              </svg>
              <span className="absolute text-3xl font-bold">{result.percentage}%</span>
            </div>
            <h2 className="text-2xl font-bold">{result.score} / {result.total}</h2>
            <p className="text-slate-400 mt-2 text-sm italic">"{getPerformanceLabel(result.percentage)}"</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-sm border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600"><Target /></div>
              <div>
                <p className="text-sm text-slate-500">Total Accuracy</p>
                <p className="text-xl font-bold">{result.percentage}% Correct</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Brain /></div>
              <div>
                <p className="text-sm text-slate-500">Topic Title</p>
                <p className="text-xl font-bold truncate max-w-[150px]">{result.test.title}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-2xl text-purple-600"><BookOpen /></div>
              <div>
                <p className="text-sm text-slate-500">Attempt Date</p>
                <p className="text-xl font-bold">{new Date(result.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><Award /></div>
              <div>
                <p className="text-sm text-slate-500">Correct Answers</p>
                <p className="text-xl font-bold">{result.score} Questions</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Coach Feedback Section */}
      <Card className="border-none bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 shadow-lg overflow-hidden border-l-4 border-l-indigo-500">
        <CardHeader className="border-b border-white/20">
          <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
            <Sparkles className="h-5 w-5 animate-pulse" />
            AI Performance Analysis
          </CardTitle>
          <CardDescription>Personalized feedback to accelerate your career growth</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {ailoading ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-indigo-600/70 animate-pulse font-medium">Consulting AI Coach...</p>
            </div>
          ) : aiFeedback ? (
            <div className="space-y-8">
              <div className="bg-white/50 dark:bg-black/20 p-5 rounded-2xl">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Executive Summary</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{aiFeedback.summary}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-bold text-emerald-700">
                    <CheckCircle className="h-5 w-5" /> Your Strengths
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    {aiFeedback.strengths}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-bold text-amber-700">
                    <XCircle className="h-5 w-5" /> Areas to Improve
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900">
                    {aiFeedback.improvements}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                <Brain className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20" />
                <h4 className="font-bold text-lg mb-2">Coach's Pro-Tip</h4>
                <p className="text-indigo-50 relative z-10 italic">"{aiFeedback.advice}"</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">Unable to load AI feedback at this time.</div>
          )}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4">
        <Button variant="outline" asChild className="w-full sm:w-auto h-12 px-8">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild className="w-full sm:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
          <Link href="/dashboard/my-tests">Take Another Assessment</Link>
        </Button>
      </div>
    </div>
  );
}

function getPerformanceLabel(pct: number) {
  if (pct >= 90) return 'Top Tier Performance';
  if (pct >= 80) return 'Highly Proficient';
  if (pct >= 70) return 'Strong Foundation';
  if (pct >= 60) return 'Developing Skills';
  return 'Focus Needed';
}