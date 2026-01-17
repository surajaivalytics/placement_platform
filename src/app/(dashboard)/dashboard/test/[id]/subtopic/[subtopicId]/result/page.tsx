'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw, List } from "lucide-react";
import { motion } from "framer-motion";

function SubtopicResultContent({ 
  params 
}: { 
  params: Promise<{ id: string; subtopicId: string }> 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [testId, setTestId] = useState<string>('');
  const [subtopicId, setSubtopicId] = useState<string>('');
  
  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const percentage = parseFloat(searchParams.get('percentage') || '0');

  useEffect(() => {
    params.then(({ id, subtopicId: subId }) => {
      setTestId(id);
      setSubtopicId(subId);
    });
  }, [params]);

  const isPassed = percentage >= 60;

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const gradeInfo = getGrade(percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
          {/* Header with gradient */}
          <div className={`${isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-red-500'} p-8 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
              <div className="w-64 h-64 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                {isPassed ? (
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <XCircle className="w-12 h-12" />
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-center mb-2">
                {isPassed ? 'Great Job!' : 'Keep Practicing!'}
              </h1>
              <p className="text-center opacity-90 text-lg">
                {isPassed ? 'You passed this subtopic' : 'You can retry to improve your score'}
              </p>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Score Display */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="text-4xl font-bold text-blue-600 mb-2">{score}</div>
                <div className="text-sm text-gray-600 font-medium">Correct</div>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <div className="text-4xl font-bold text-purple-600 mb-2">{total}</div>
                <div className="text-sm text-gray-600 font-medium">Total</div>
              </div>
              <div className={`text-center p-6 rounded-2xl border ${gradeInfo.bg}`}>
                <div className={`text-4xl font-bold ${gradeInfo.color} mb-2`}>
                  {Math.round(percentage)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">Score</div>
              </div>
            </div>

            {/* Grade Badge */}
            <div className="flex justify-center mb-8">
              <Badge className={`${gradeInfo.bg} ${gradeInfo.color} text-2xl px-8 py-3 font-bold border-2`}>
                Grade: {gradeInfo.grade}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Accuracy</span>
                <span className="text-sm font-bold text-gray-900">{Math.round(percentage)}%</span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full ${isPassed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push(`/dashboard/test/${testId}/subtopics`)}
                variant="outline"
                className="h-14 rounded-xl font-semibold border-2 hover:bg-gray-50"
              >
                <List className="w-5 h-5 mr-2" />
                All Subtopics
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/test/${testId}/subtopic/${subtopicId}`)}
                variant="outline"
                className="h-14 rounded-xl font-semibold border-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Retry
              </Button>
              <Button
                onClick={() => router.push('/dashboard/topics')}
                className="h-14 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Topics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600 italic">
            {isPassed 
              ? "Excellent work! Keep up the momentum and tackle the next subtopic."
              : "Don't give up! Review the material and try again to improve your score."}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SubtopicResultPage({ 
  params 
}: { 
  params: Promise<{ id: string; subtopicId: string }> 
}) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <SubtopicResultContent params={params} />
    </Suspense>
  );
}
