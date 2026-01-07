'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Trophy, Clock, Target, Share2, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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

const getCompanyLogo = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes('tcs')) return '/logos/tcs-1696999494.jpg';
  if (lower.includes('wipro')) return '/logos/Wipro_Secondary-Logo_Color_RGB.png';
  if (lower.includes('ibm')) return '/logos/IBM.png';
  if (lower.includes('accenture')) return '/logos/acc.png';
  return null; // Return null if no specific logo found
};

export default function ResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const resultId = params.id as string;
        const response = await fetch(`/api/results?id=${resultId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch result');
        }

        const data = await response.json();
        setResult(data.result);
      } catch (err) {
        console.error('Error fetching result:', err);
        setError(err instanceof Error ? err.message : 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchResult();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <XCircle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Result Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          {error || "We couldn't locate the results for this test. It may have been deleted or never existed."}
        </p>
        <Button asChild className="bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (percentage >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGradient = (percentage: number) => {
    if (percentage >= 80) return 'from-emerald-500 to-teal-600 shadow-emerald-200';
    if (percentage >= 60) return 'from-amber-400 to-orange-500 shadow-amber-200';
    return 'from-red-500 to-pink-600 shadow-red-200';
  }

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return { label: 'Outstanding Performance!', icon: Trophy, color: 'text-emerald-600' };
    if (percentage >= 80) return { label: 'Great Job!', icon: Award, color: 'text-teal-600' };
    if (percentage >= 60) return { label: 'Good Effort!', icon: Target, color: 'text-amber-600' };
    return { label: 'Needs Improvement', icon: Clock, color: 'text-red-600' };
  };

  const performance = getPerformanceLabel(result.percentage);
  const Logo = getCompanyLogo(result.test.title);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 bg-white text-gray-500 border-gray-200">
            Completed on {new Date(result.createdAt).toLocaleDateString()}
          </Badge>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Assessment Report</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="rounded-xl border-gray-200 text-gray-600">
            Back
          </Button>
          <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600 flex gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        {/* Main Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2"
        >
          <Card className="border-0 shadow-xl overflow-hidden rounded-3xl relative h-full bg-white">
            <div className={`absolute top-0 w-full h-2 bg-gradient-to-r ${getGradient(result.percentage)}`} />
            <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  {Logo ? (
                    <img src={Logo} alt="Company Logo" className="h-8 object-contain" />
                  ) : (
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Award className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">{result.test.difficulty}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{result.test.title}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
                  <performance.icon className={`w-5 h-5 ${performance.color}`} />
                  <p className={`font-bold ${performance.color}`}>{performance.label}</p>
                </div>
              </div>

              <div className="relative">
                {/* Circular Progress (Visual only for now) */}
                <div className={`w-40 h-40 rounded-full flex items-center justify-center bg-gradient-to-br ${getGradient(result.percentage)} shadow-lg transform transition-transform hover:scale-105`}>
                  <div className="w-[150px] h-[150px] bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                    <span className="text-4xl font-extrabold text-gray-900">{result.percentage}%</span>
                    <span className="text-xs font-bold text-gray-400 uppercase">Score</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-rows-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border border-gray-100 shadow-md rounded-2xl bg-white hover:shadow-lg transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Correct Answers</p>
                  <h3 className="text-2xl font-bold text-gray-900">{result.score} <span className="text-sm text-gray-400 font-medium">/ {result.total}</span></h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border border-gray-100 shadow-md rounded-2xl bg-white hover:shadow-lg transition-all">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Net Accuracy</p>
                  <h3 className="text-2xl font-bold text-gray-900">{Math.round((result.score / result.total) * 100)}%</h3>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>

      {/* AI Feedback Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border border-indigo-100 shadow-xl shadow-indigo-50/50 rounded-3xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-8 py-4 border-b border-indigo-100 flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <Award className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-indigo-900 text-lg">AI Performance Analysis</h3>
          </div>
          <CardContent className="p-8">
            {result.aiFeedback ? (
              <div className="prose prose-indigo max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                  {result.aiFeedback}
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 italic">No AI feedback generated for this test result.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 h-12 px-8 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1">
          <Link href="/dashboard/my-tests">
            Take Another Test <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
