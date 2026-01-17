'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, TrendingUp, TrendingDown, ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

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

export default function TopicSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [testId, setTestId] = useState<string>('');
  const [testTitle, setTestTitle] = useState<string>('');
  const [subtopics, setSubtopics] = useState<SubtopicProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setTestId(id);

      // Fetch test details
      fetch(`/api/tests?id=${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.test) {
            setTestTitle(data.test.title);
          }
        })
        .catch(err => console.error('Failed to fetch test:', err));

      // Fetch subtopics with progress
      fetch(`/api/tests/${id}/subtopics`)
        .then(res => res.json())
        .then(data => {
          if (data.subtopics) {
            setSubtopics(data.subtopics.filter((s: SubtopicProgress) => s.progress?.completed));
          }
        })
        .catch(err => console.error('Failed to fetch subtopics:', err))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Calculate overall statistics
  const totalScore = subtopics.reduce((sum, s) => sum + (s.progress?.score || 0), 0);
  const totalQuestions = subtopics.reduce((sum, s) => sum + (s.progress?.total || 0), 0);
  const overallPercentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
  
  // Find strongest and weakest areas
  const sortedByPerformance = [...subtopics].sort((a, b) => 
    (b.progress?.percentage || 0) - (a.progress?.percentage || 0)
  );
  const strongestArea = sortedByPerformance[0];
  const weakestArea = sortedByPerformance[sortedByPerformance.length - 1];

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-50' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const gradeInfo = getGrade(overallPercentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/topics')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Topics
          </Button>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{testTitle}</h1>
              <p className="text-gray-600 text-lg">Topic Summary Report</p>
            </div>
          </div>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8" />
                Overall Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-5xl font-bold mb-2">{totalScore}</div>
                  <div className="text-sm opacity-90">Correct Answers</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-5xl font-bold mb-2">{totalQuestions}</div>
                  <div className="text-sm opacity-90">Total Questions</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-5xl font-bold mb-2">{Math.round(overallPercentage)}%</div>
                  <div className="text-sm opacity-90">Accuracy</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-5xl font-bold mb-2">{gradeInfo.grade}</div>
                  <div className="text-sm opacity-90">Grade</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Strongest Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-5 h-5" />
                  Strongest Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{strongestArea?.name}</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-green-600">
                    {Math.round(strongestArea?.progress?.percentage || 0)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {strongestArea?.progress?.score}/{strongestArea?.progress?.total} correct
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weakest Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <TrendingDown className="w-5 h-5" />
                  Needs Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{weakestArea?.name}</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-orange-600">
                    {Math.round(weakestArea?.progress?.percentage || 0)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {weakestArea?.progress?.score}/{weakestArea?.progress?.total} correct
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/test/${testId}/subtopic/${weakestArea?.id}`)}
                  className="mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Practice Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Subtopic Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl">Subtopic-wise Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subtopics.map((subtopic, index) => {
                  const percentage = subtopic.progress?.percentage || 0;
                  const grade = getGrade(percentage);
                  
                  return (
                    <motion.div
                      key={subtopic.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900">{subtopic.name}</h4>
                          <p className="text-sm text-gray-600">
                            {subtopic.progress?.score}/{subtopic.progress?.total} correct
                          </p>
                        </div>
                        <Badge className={`${grade.bg} ${grade.color} text-lg px-4 py-2 font-bold`}>
                          {Math.round(percentage)}%
                        </Badge>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex justify-center gap-4"
        >
          <Button
            onClick={() => router.push(`/dashboard/test/${testId}/subtopics`)}
            size="lg"
            variant="outline"
            className="h-14 px-8 rounded-xl font-semibold border-2"
          >
            View All Subtopics
          </Button>
          <Button
            onClick={() => router.push('/dashboard/topics')}
            size="lg"
            className="h-14 px-8 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            Explore More Topics
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
